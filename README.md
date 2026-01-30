# KYC Verification API

A backend API for **user identity verification (KYC)** built with **Node.js, Express, TypeScript, and MongoDB**.  
It supports authentication, role-based access control, transactional KYC workflows, audit logging, and is containerized for deployment.

This project was built as part of a **backend assessment**.

---

## Features

- User authentication (JWT)
- Role-based access control (User / Admin)
- KYC lifecycle management:
  - Create / update KYC draft
  - Submit KYC (transactional)
  - Admin review (approve / reject – transactional)
  - User delete KYC (status-restricted)
- MongoDB transactions (replica set)
- Centralized error handling
- Audit logging (MongoDB)
- Postman collection for testing
- Dockerized deployment

---

## Tech Stack

- **Node.js (18+)**
- **Express**
- **TypeScript**
- **MongoDB (Atlas / replica set)**
- **Mongoose**
- **JWT Authentication**
- **Zod** (request validation)
- **Winston + winston-mongodb**
- **Docker**

---

## Project Structure

```txt
src/
  app.ts
  index.ts
  config/
    db.ts
    swagger.ts
  middlewares/
    requireAuth.ts
    requireRole.ts
    errorHandler.ts
  models/
    user.model.ts
    kycSubmission.model.ts
    auditLog.model.ts
  modules/
    auth/
    kyc/
    admin/
  utils/
    apiError.ts
```

PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/credpal
MONGO_LOGS_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/credpal_logs

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
