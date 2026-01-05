
---

# 📘 **Frontend/README.md**


# 🎨 Frontend – Courses & Lessons App

This is the frontend application for the Courses & Lessons platform.

It is built using **React + Vite (JavaScript)** and communicates with the backend API via REST.

---

## 🚀 Features

- Login & Register
- JWT authentication stored in localStorage
- Courses screen:
  - List courses
  - Search and filter by status
  - Pagination
  - Create, edit, delete
  - Publish / Unpublish
- Course details screen:
  - Manage lessons
  - Ordered lessons
  - Reorder lessons (up / down)
  - Edit and delete lessons
- Logout functionality

---

## 🧱 Project Structure
```
src/
├── api.js
├── auth.js
├── App.jsx
└── pages/
├── Login.jsx
├── Register.jsx
├── Courses.jsx
├── CourseDetails.jsx
└── Dashboard.jsx
```


---

## ⚙️ Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
Adjust the URL to match the backend running API.
```

### Run the Front 
```

npm install
npm run dev
```

 ### 🔐 Authentication Flow

User logs in or registers

Backend returns a JWT

Token is stored in localStorage

Axios interceptor sends token on each request

Protected screens require authentication
