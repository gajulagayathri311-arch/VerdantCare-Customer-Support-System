# VerdantCare — Customer Support Backend (Node.js + Express + MySQL)

REST API backend for the Customer Support Management System with persistent MySQL data storage.

---

## 📋 Prerequisites
1. **Node.js** (v18 or higher)
2. **MySQL Server** (running locally or remotely)
   - Default Port: `3306`
   - Default User: `root`

---

## ⚙️ Configuration (`.env`)
Edit `backend/.env` to match your local MySQL credentials:

```env
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=customer_support_db
DB_PORT=3306
```

> **Note:** The backend automatically creates the `customer_support_db` database and runs `database/schema.sql` to initialize tables and sample seed data if not yet created!

---

## 🚀 Running the Backend Server

```bash
# 1. Navigate to backend directory
cd backend

# 2. Start server in development mode (auto-reload on save)
npm run dev

# Or in standard production mode:
npm start
```

The server will start on **`http://localhost:8080`**.

---

## 🗄️ Database Tables (`schema.sql`)

| Table Name | Description |
| :--- | :--- |
| `users` | Customer & Admin accounts with hashed passwords and role (`CUSTOMER`, `ADMIN`). |
| `tickets` | Main tickets table (id, user_id, subject, description, category, priority, status, assigned_to, rating, etc.). |
| `ticket_messages` | Full back-and-forth discussion messages thread between customer and support staff. |
| `ticket_attachments` | Simulated file attachments linked to tickets. |
| `knowledge_base` | Categorized self-service troubleshooting guides and helpfulness votes. |

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new customer or agent account.
- `POST /api/auth/login` — Sign in and receive user profile.

### 🎫 Tickets (`/api/tickets`)
- `GET /api/tickets` — Get all tickets in queue (Admin / Agent view).
- `GET /api/tickets/user/:userId` — Get tickets for specific customer.
- `GET /api/tickets/:id` — Get single ticket with full message discussion thread.
- `POST /api/tickets` — Create a new support ticket.
- `PUT /api/tickets/:id/status` — Update ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
- `PUT /api/tickets/:id/assign` — Reassign ticket to specific support specialist.
- `PUT /api/tickets/bulk-status` — Batch update status of multiple tickets.
- `POST /api/tickets/:id/messages` — Post reply into conversation thread.
- `POST /api/tickets/:id/rating` — Submit 5-star customer satisfaction review.

### 📖 Knowledge Base (`/api/kb`)
- `GET /api/kb` — Get all published troubleshooting guides.
- `POST /api/kb/:id/vote` — Submit helpfulness vote (`{ isHelpful: true/false }`).
