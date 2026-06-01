const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Database storage setup
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to load/save JSON data
function loadJSON(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
        return [];
    }
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error(`Error reading ${filename}, resetting database:`, err.message);
        return [];
    }
}

function saveJSON(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) console.error(`Error saving database ${filename}:`, err.message);
    });
}

// Simple query evaluator supporting key-value matching, $or, and $gt
function matches(doc, query) {
    if (!query || Object.keys(query).length === 0) return true;

    for (const key of Object.keys(query)) {
        const val = query[key];

        // Handle Mongoose $or operator
        if (key === '$or' && Array.isArray(val)) {
            const matchedAny = val.some(subQuery => matches(doc, subQuery));
            if (!matchedAny) return false;
            continue;
        }

        // Handle specific comparisons
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            // $gt check (e.g. for token expiration)
            if (val.$gt !== undefined) {
                const docVal = doc[key] instanceof Date ? doc[key].getTime() : new Date(doc[key]).getTime();
                const compareVal = val.$gt instanceof Date ? val.$gt.getTime() : new Date(val.$gt).getTime();
                if (!(docVal > compareVal)) return false;
                continue;
            }
        }

        // Standard direct matching
        // If comparing ObjectIds or string IDs, cast to string
        const docVal = doc[key] ? doc[key].toString() : undefined;
        const queryVal = val ? val.toString() : undefined;
        if (docVal !== queryVal) return false;
    }
    return true;
}

// Deep clone helper
function clone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
}

// User Document Class with Helper methods
class UserDocument {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = crypto.randomUUID();
        if (!this.createdAt) this.createdAt = new Date().toISOString();
        if (this.isVerified === undefined) this.isVerified = true; // Auto-verify
    }

    get id() {
        return this._id;
    }

    async save(options = {}) {
        // Hash password if modified or newly set and not already hashed
        if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        const users = loadJSON('users.json');
        const index = users.findIndex(u => u._id === this._id);

        const rawData = this.toObject();

        if (index !== -1) {
            users[index] = rawData;
        } else {
            users.push(rawData);
        }

        saveJSON('users.json', users);
        return this;
    }

    correctPassword(candidatePassword, userPassword) {
        // userPassword might be undefined if passwords weren't selected
        const pw = userPassword || this.password;
        if (!pw) return false;
        return bcrypt.compareSync(candidatePassword, pw);
    }

    createEmailVerificationToken() {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        this.emailVerificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        return verificationToken;
    }

    toObject() {
        const raw = { ...this };
        // Clean up internal non-serializable fields if any
        return raw;
    }
}

// Generic Document Class
class GenericDocument {
    constructor(data, filename) {
        Object.assign(this, data);
        this._filename = filename;
        if (!this._id) this._id = crypto.randomUUID();
        if (!this.createdAt) this.createdAt = new Date().toISOString();
    }

    get id() {
        return this._id;
    }

    async save() {
        const dataList = loadJSON(this._filename);
        const index = dataList.findIndex(d => d._id === this._id);

        const rawData = this.toObject();

        if (index !== -1) {
            dataList[index] = rawData;
        } else {
            dataList.push(rawData);
        }

        saveJSON(this._filename, dataList);
        return this;
    }

    toObject() {
        const raw = { ...this };
        delete raw._filename;
        return raw;
    }
}

// Query Class to support Mongoose method chaining (.select, .sort, thenable)
class Query {
    constructor(promise) {
        this.promise = promise;
    }

    select(fields) {
        // Dummy select logic - returns query instance for chaining
        return this;
    }

    sort(sortStr) {
        this.promise = this.promise.then(res => {
            if (Array.isArray(res)) {
                if (sortStr === '-createdAt') {
                    return res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                }
            }
            return res;
        });
        return this;
    }

    // Thenable implementation to support direct await
    then(onFulfilled, onRejected) {
        return this.promise.then(onFulfilled, onRejected);
    }
}

// Mock Model Class matching Mongoose API
class Model {
    constructor(filename, docClass) {
        this.filename = filename;
        this.docClass = docClass;
    }

    // Wrap raw object in Document class
    wrap(raw) {
        if (!raw) return null;
        if (this.docClass === UserDocument) {
            return new UserDocument(raw);
        }
        return new GenericDocument(raw, this.filename);
    }

    findOne(query) {
        const promise = (async () => {
            const data = loadJSON(this.filename);
            const matched = data.find(d => matches(d, query));
            return this.wrap(matched);
        })();
        return new Query(promise);
    }

    findById(id) {
        const promise = (async () => {
            if (!id) return null;
            const data = loadJSON(this.filename);
            const matched = data.find(d => d._id === id.toString());
            return this.wrap(matched);
        })();
        return new Query(promise);
    }

    find(query) {
        const promise = (async () => {
            const data = loadJSON(this.filename);
            const matched = data.filter(d => matches(d, query)).map(d => this.wrap(d));
            return matched;
        })();
        return new Query(promise);
    }

    async create(data) {
        const doc = this.wrap(data);
        await doc.save();
        return doc;
    }

    async findByIdAndUpdate(id, update, options = {}) {
        if (!id) return null;
        const doc = await this.findById(id);
        if (!doc) return null;

        // Apply update operations
        const rawUpdate = update.$inc || update.$set || update;
        
        // Handle increment ($inc)
        if (update.$inc) {
            for (const key of Object.keys(update.$inc)) {
                const pathParts = key.split('.');
                let current = doc;
                for (let i = 0; i < pathParts.length - 1; i++) {
                    if (!current[pathParts[i]]) current[pathParts[i]] = {};
                    current = current[pathParts[i]];
                }
                const lastKey = pathParts[pathParts.length - 1];
                current[lastKey] = (current[lastKey] || 0) + update.$inc[key];
            }
        }
        
        // Handle set/standard updates ($set or plain object keys)
        const setObj = update.$set || (update.$inc ? {} : update);
        for (const key of Object.keys(setObj)) {
            const pathParts = key.split('.');
            let current = doc;
            for (let i = 0; i < pathParts.length - 1; i++) {
                if (!current[pathParts[i]]) current[pathParts[i]] = {};
                current = current[pathParts[i]];
            }
            const lastKey = pathParts[pathParts.length - 1];
            current[lastKey] = setObj[key];
        }

        await doc.save();
        return doc;
    }

    async findOneAndDelete(query) {
        const dataList = loadJSON(this.filename);
        const index = dataList.findIndex(d => matches(d, query));
        if (index === -1) return null;

        const deleted = dataList.splice(index, 1)[0];
        saveJSON(this.filename, dataList);
        return this.wrap(deleted);
    }

    async countDocuments(query) {
        const data = loadJSON(this.filename);
        return data.filter(d => matches(d, query)).length;
    }

    // Mock aggregate specifically for scan stats grouping
    async aggregate(pipeline) {
        const data = loadJSON(this.filename);
        
        // 1) Find match stage if any
        const matchStage = pipeline.find(stage => stage.$match);
        let filtered = data;
        if (matchStage) {
            filtered = data.filter(d => matches(d, matchStage.$match));
        }

        // 2) Find group stage if any
        const groupStage = pipeline.find(stage => stage.$group);
        if (groupStage) {
            const groupField = groupStage.$group._id.replace('$', '');
            const counts = {};
            
            filtered.forEach(d => {
                const key = d[groupField] || 'Unknown';
                counts[key] = (counts[key] || 0) + 1;
            });

            return Object.keys(counts).map(key => ({
                _id: key,
                count: counts[key]
            }));
        }

        return filtered;
    }
}

// User Mock Constructor class for "new User(data)"
function User(data) {
    return new UserDocument(data);
}
// Attach Model prototype methods to the constructor so User.findOne works
Object.setPrototypeOf(User, new Model('users.json', UserDocument));

// Scan Model
const Scan = new Model('scans.json', GenericDocument);

// Order Model
const Order = new Model('orders.json', GenericDocument);

module.exports = {
    User,
    Scan,
    Order
};
