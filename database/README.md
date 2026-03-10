# PlantCare AI - Database Documentation

This folder contains information about the database layer used in the PlantCare AI platform.

## 🗄️ Database Technology
- **Engine**: MongoDB
- **Type**: NoSQL Document-Oriented
- **Connection**: Managed via Mongoose ODM (in `backend/server.js`)

## 📄 Data Models

### 1. User (`User.js`)
Stores authentication and profile information.
- `name`: Full name of the user.
- `email`: Unique login email.
- `password`: Hashed credentials.
- `role`: user / admin.
- `photo`: Profile image URL.

### 2. Scan (`Scan.js`)
Records history of plant disease detections.
- `user`: Reference to the User ID.
- `plantName`: Name of the plant scanned.
- `disease`: Identified disease or "Healthy".
- `confidence`: AI confidence score (percentage).
- `imageUrl`: Path to the scanned image.
- `createdAt`: Timestamp.

### 3. Order (`Order.js`)
(Internal) Logic for future marketplace integrations.

## 🚀 How to Run
The database is automatically orchestrated via Docker:
- **Image**: `mongo:latest`
- **Port**: `27017`
- **URI**: `mongodb://localhost:27017/plantcare`

To view data manually, use **MongoDB Compass** or **Robo 3T** and connect to the local URI.
