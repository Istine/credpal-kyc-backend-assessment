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

## Environment Variables

Create a `.env` file in the project root:

PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/credpal
MONGO_LOGS_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/credpal_logs

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h

**Important:** MongoDB must run as a **replica set**. MongoDB Atlas works by default.

## Running Locally (without Docker)

npm install
npm run dev

Server runs on:

http://localhost:5000

Health check:

GET /health

---

## Running with Docker

docker build -t kyc-api .
docker run -p 5000:5000 --env-file .env kyc-api

---

## Authentication

All protected routes require a JWT:

Authorization: Bearer <token>

---

## API Routes

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### User KYC

- `GET /kyc/me`
- `PATCH /kyc/me`
- `POST /kyc/me/submit`
- `DELETE /kyc/me`

### Admin KYC

- `GET /admin/kyc`
- `GET /admin/kyc/:id`
- `PATCH /admin/kyc/:id/review`

---

## KYC Status Rules

| Action       | Allowed Status          |
| ------------ | ----------------------- |
| Edit KYC     | DRAFT, REJECTED         |
| Submit KYC   | DRAFT, REJECTED         |
| Delete KYC   | DRAFT, REJECTED         |
| Admin Review | SUBMITTED, UNDER_REVIEW |

---

## Transactions

MongoDB transactions are used for:

- KYC submission
- Admin review (approve / reject)
- Audit logging consistency

This requires MongoDB running as a **replica set**.

---

## API Testing (Postman)

Postman is the primary testing tool.

Steps:

1. Import the provided Postman collection and environment
2. Set `baseUrl`
3. Register or login to auto-save JWT
4. Test all endpoints

## Notes

- Refresh tokens are intentionally omitted to keep scope focused
- Email verification is not included
- File uploads are represented as metadata URLs
- Audit logs include `requestId` for traceability

---

## Deployment

The application can be containerized and deployed.

MongoDB Atlas is used for the production database.
