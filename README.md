# 📚 Courses & Lessons Platform – Technical Assessment

This repository contains a **fullstack application** developed as part of a technical assessment.

The platform allows authenticated users to manage **Courses** and **Lessons**, including publishing workflows, ordering, and soft deletion with data integrity.

---

## 🧱 Project Structure


```
Assessment/
├── Backend/
│ ├── Assessment.Api
│ ├── Assessment.Application
│ ├── Assessment.Domain
│ ├── Assessment.Infrastructure
│ └── Assessment.Tests
│
└── Frontend/
└── assessment-frontend

```

---

## 🚀 Features

### Backend
- ASP.NET Core (.NET 8)
- Clean Architecture (Api / Application / Domain / Infrastructure)
- JWT Authentication
- Courses & Lessons CRUD
- Publish / Unpublish courses
- Ordered lessons with reorder (move up / down)
- Soft delete with order compaction
- MySQL database
- EF Core with migrations
- Automated tests (xUnit)

### Frontend
- React + Vite (JavaScript)
- Login & Register
- JWT-based authentication
- Courses list with search, pagination and status filter
- Lessons management per course
- Two-screen navigation (Courses / Course Details)
- Publish / Unpublish workflow
- Logout support

---

## 🛠️ Tech Stack

- **Backend:** C#, ASP.NET Core, EF Core, MySQL
- **Frontend:** React, Vite, Axios
- **Auth:** JWT
- **Testing:** xUnit

---

## 📄 Documentation

- [`Backend/README.md`](./Backend/README.md)
- [`Frontend/README.md`](./Frontend/README.md)




