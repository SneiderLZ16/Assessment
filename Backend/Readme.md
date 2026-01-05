# 🧠 Backend – Courses & Lessons API

This project is the backend API for the Courses & Lessons platform.

It is built using **ASP.NET Core (.NET 8)** and follows **Clean Architecture principles**.

---

## 🧱 Architecture


```
Assessment.Infrastructure
Assessment.Application
Assessment.Domain
Assessment.Api

```


### Responsibilities
- **Domain:** Entities, enums, core business rules
- **Application:** Use cases, services, DTOs
- **Infrastructure:** EF Core, MySQL, migrations
- **API:** Controllers, authentication, request/response handling

---

## 🚀 Features

- JWT Authentication (Login / Register)
- Courses:
  - Create, update, delete (soft delete)
  - Publish / Unpublish
  - Search with pagination and filters
- Lessons:
  - Create, update, delete (soft delete)
  - Ordered lessons per course
  - Reordering (move up / move down)
- Data integrity for lesson ordering
- Automated tests

---

## 🗄️ Database

- **Database:** MySQL
- **ORM:** Entity Framework Core
- **Migrations:** EF Core migrations
---

## ⚙️ Configuration

### Clone the repository:
   ```
   git clone <repository-url>
   ```
   
### Connection String (example)
```json
"ConnectionStrings": {
  "DefaultConnection": "server=localhost;database=assessment;user=root;password=yourpassword"
},
 "Jwt": {
    "Key": "SUPER_SECRET_KEY_CHANGE_ME_1234567890",
    "Issuer": "AssessmentApi",
    "Audience": "AssessmentApiUsers",
    "ExpiresMinutes": 120
```

### Run Project 
```
dotnet run --project Assessment.Api
