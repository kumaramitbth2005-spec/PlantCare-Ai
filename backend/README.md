# PlantCare AI - Backend API Documentation

This is the backend service for the PlantCare AI platform, built with **Node.js** and **Express.js**.

## 🚀 Features
- **Authentication**: JWT-based login and registration.
- **RESTful API**: Structured endpoints for scans, users, and reports.
- **File Uploads**: Handles plant images for AI processing.
- **Database Integration**: Connects with MongoDB via Mongoose.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose 
- **Validation**: Joi / Validator

## 🛠️ Setup & Installation
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file in this directory with the following:
    ```env
    PORT=8000
    MONGO_URI=mongodb://localhost:27017/plantcare
    JWT_SECRET=your_secret_key
    ```
3.  **Run the Server**:
    ```bash
    npm start
    ```
    The API will be available at `http://localhost:8000`.

## 📄 API Endpoints
- `POST /api/auth/register` - Create a new user.
- `POST /api/auth/login` - Authenticate user.
- `GET /api/scans` - Fetch all scan history for the user.
- `POST /api/scans/upload` - Upload an image for disease detection.

## 🐳 Docker
Build and run via the root `docker-compose.yml` or:
```bash
docker build -t plantcare-backend .
```
