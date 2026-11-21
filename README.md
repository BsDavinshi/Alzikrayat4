# Alzikrayat (الذكريات) — MERN Edition + Project 4 Bonus (Track A: JWT-Based Authentication)

This repository builds directly on **Course Project 3 (Alzikrayat — MERN Edition)** — preserving the full warm amber/cream design, dark mode, 5 gallery display styles, 13-filter canvas studio, albums, likes, tagging, and member profiles — and integrates **Course Project 4 (Optional Bonus) — Track A: JWT-Based Authentication**.

## Selected Track & Rationale

- **Selected Track**: **Track A — JWT-Based Authentication**
- **Rationale**: Replaces Project 3's basic auth with stateless **JSON Web Token (JWT)** authentication (`Authorization: Bearer <token>`), Express route-protection middleware on every write operation, and an **Axios interceptor** on the React client.

## What Changed from Project 3

1. **JWT Issuance (`server/controllers/authController.js`)**:
   - `POST /api/auth/register` and `POST /api/auth/login` sign a JWT using `process.env.JWT_SECRET` and return `{ token, user }`.
   - Added protected `GET /api/auth/me` to verify stored sessions on reload.
2. **Protected Route Middleware (`server/middleware/authMiddleware.js`)**:
   - Validates `Authorization: Bearer <token>` and protects all write endpoints: `POST /api/photos`, `DELETE /api/photos/:id`, `POST /api/photos/:id/like`, `DELETE /api/photos/:id/tags/:targetUserId`, `POST /api/photos/:id/comments`, `DELETE /api/comments/:commentId`, `POST /api/albums`, `DELETE /api/albums/:id`, and `PUT /api/users/me`.
3. **Axios Interceptor (`client/src/utils/api.js`)**:
   - Stores the token in `localStorage` (`alzikrayat_token`) and automatically injects `Authorization: Bearer <token>` on every API request.
   - Clears the token and session automatically on Logout or `401 Unauthorized`.

## Local Setup Instructions

### 1. Backend (`server/`)
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env` and set both `MONGODB_URI` and a strong `JWT_SECRET`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/alzikrayat
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_random_key_here
JWT_EXPIRES_IN=7d
```

*(Optional, recommended)* Seed demo members, albums, and the 12 sample photos:
```bash
npm run seed
```
Demo account: `sara@alzikrayat.test` / `Password123`

Start the Express server:
```bash
npm run dev
```

### 2. Frontend (`client/`)
```bash
cd client
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.
