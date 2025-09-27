# MERN Authentication & Authorization App

A full-stack authentication and authorization system built with the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.
The app supports **JWT-based authentication**, **role-based authorization**, and **multi-device session handling**.

---

## 🚀 Live Demo

* **Frontend (Vercel)**: [MERN Auth Frontend](https://mern-authentication-authorization-pearl.vercel.app/)
* **Backend (Vercel)**: [MERN Auth Backend](https://mern-authentication-authorization-3.vercel.app/)

---

## 📌 Features

* ✅ User Registration (Email / Mobile number with OTP support)
* ✅ Login & Logout (multi-device session support)
* ✅ JWT Authentication (Access + Refresh Tokens)
* ✅ Role-based Authorization (Admin / User)
* ✅ Persistent Sessions with Refresh Token rotation
* ✅ Protected Routes in both frontend & backend
* ✅ Responsive UI (React + Tailwind/Material UI)

---

## 🛠️ Tech Stack

**Frontend**

* React.js (with Context API/Redux for state management)
* React Router (for navigation & protected routes)
* Axios (for API calls)
* Tailwind CSS / Material UI (for styling)

**Backend**

* Node.js + Express.js
* MongoDB + Mongoose (User & Session models)
* JWT (Access & Refresh Tokens)
* bcrypt.js (Password hashing)
* dotenv (Environment variables)
* cookie-parser (Secure cookie storage for refresh tokens)

---

## 📂 Project Structure

### Frontend

```
/client
  ├── src
  │   ├── context/                    # Auth context / state management
  │   ├── pages/                      # Login, Register, Home, Dashboard
  │   ├── apiInterceptor.js           # Axios setup, helpers
  │   └── App.js                      # Main app entry
```

### Backend

```
/server
  ├── models/              # User models
  ├── routes/              # Auth routes (login, register, logout, refresh)
  ├── middleware/          # Auth middleware (JWT verify, role check, multer)
  ├── controllers/         # Business logic for auth & user handling
  ├── config/              # Token generator, cloudinary config
  └── server.js            # App entry point
```

---

## ⚙️ Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/mern-authentication-authorization.git
cd mern-authentication-authorization
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_SERVER_URL=http://localhost:3000
```

Start the frontend:

```bash
npm start
```

---

## 🔒 Authentication Flow

1. **Register/Login** → User receives an **Access Token (short-lived)** and a **Refresh Token (long-lived)**.
2. **Access Token** → Stored in memory (for API requests).
3. **Refresh Token** → Stored in **HTTP-only cookie** (secure & not accessible by JS).
4. **Token Expiry** → When the access token expires, the frontend requests a new one using the refresh token.
5. **Logout** → Refresh token is invalidated on the server (user logged out across devices if required).

---

## 🧑‍💻 Usage

* Register with **Email or Mobile OTP**
* Login using credentials
* Access protected routes (Dashboard, Profile, etc.)
* Admin users can access **restricted routes**
* Logout clears tokens

---

## 📜 License

This project is licensed under the **MIT License**.

---

## ✨ Author

Developed by **Shaik Sameer** 🚀
Feel free to contribute or raise issues!
