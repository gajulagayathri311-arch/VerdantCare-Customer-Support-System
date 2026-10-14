# 🌿 VerdantCare — Intelligent Customer Support Management System

[![Live Frontend](https://img.shields.io/badge/Live_Frontend-Vercel-success?style=for-the-badge&logo=vercel)](https://verdant-care-customer-support-syste.vercel.app)
[![Live Backend API](https://img.shields.io/badge/Backend_API-Render-informational?style=for-the-badge&logo=render)](https://verdantcare-customer-support-system.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MySQL_8.0+-blue?style=for-the-badge&logo=mysql)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

An enterprise-ready, end-to-end **Customer Support Management Platform** built with **React 18 + Vite**, **Express.js**, **MySQL 8.0+**, and an integrated **24/7 AI Copilot (OliveAI)**. Features a calming, modern **Warm Tuscan Sand & Herbal Olive Green** design system, full client-side theme switching, and an innovative **Purpose-Driven Resolution Workflow**.

---

## 🌐 Live Deployments

| Service | Provider | Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://verdant-care-customer-support-syste.vercel.app](https://verdant-care-customer-support-syste.vercel.app) |
| **Backend REST API** | **Render** | [https://verdantcare-customer-support-system.onrender.com](https://verdantcare-customer-support-system.onrender.com) |
| **API Health Status** | **Render** | [https://verdantcare-customer-support-system.onrender.com/api/health](https://verdantcare-customer-support-system.onrender.com/api/health) |

---

## 🔑 Demo Access Credentials

The platform includes pre-seeded demo accounts with one-click quick-login buttons on the Sign In page:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Support Admin** | `alex.mercer@verdantcare.com` | `admin123` | Full ticket queue triage, purpose assignment, milestone tracking, analytics |
| **Customer User** | `sarah.jenkins@example.com` | `password123` | Ticket creation with resolution purpose, conversation replies, ratings |

---

## 🎯 Key Features & Capabilities

### 1. 🎯 Purpose-Driven Resolution Workflow
Unlike traditional ticketing systems that simply mark tickets as "In Progress", VerdantCare assigns explicit **Resolution Objectives & Milestone Checklists**:
- **Structured Purposes**: *Refund & Financial Adjustment*, *Root-Cause Bugfix*, *Account Security & Access Recovery*, *Performance Optimization*.
- **Interactive Checklists**: Real-time completion checkboxes for operational transparency.
- **SLA & Target Resolution Dates**: Automated milestone deadlines and target resolution tracking.

### 2. 🤖 24/7 OliveAI Customer Copilot
- Contextual floating assistant for instant problem diagnostics and self-service troubleshooting.
- **One-Click Auto-Drafting**: Converts natural language chat triage directly into an official MySQL-backed support ticket.
- Pre-loaded quick prompts for billing discrepancies, 2FA failures, and browser caching issues.

### 3. 🎨 Warm Tuscan Sand & Herbal Olive Aesthetic
- **Whole-Site Canvas**: Built on `--bg-color: #EDE3D0` with ambient mesh lighting gradients.
- **Silk Parchment Surfaces**: Soft creamy card containers (`rgba(250, 244, 232, 0.92)`) replacing harsh white boxes.
- **Theme Presets (Navbar Switcher)**:
  - 🌾 **Tuscan Sand & Olive** (Active Default)
  - 🌿 **Warm Linen & Olive Dew**
  - 🍃 **Sage Oasis & Fresh Meadow**
  - 🌑 **Olive Nocturne (Dark Mode)**

### 4. 📊 Operations Analytics & Ticket Queue
- **Admin Command Dashboard**: Real-time breakdown of open, in-progress, high-priority, and resolved tickets with purpose allocation metrics.
- **Staff Queue Management**: Bulk status updates, filter by category/priority/purpose, and agent reassignments.
- **Knowledge Base**: Searchable documentation with category filtering and helpful voting.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│     VERDANTCARE REACT + VITE FRONTEND (Vercel)         │
│     SPA Routing • Theme Presets • OliveAI Copilot      │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTPS / Bearer JWT Token
                            ▼
┌────────────────────────────────────────────────────────┐
│       NODE.JS + EXPRESS.JS BACKEND (Render)            │
│  Auth Controller • Ticket Controller • KB Controller   │
└───────────────────────────┬────────────────────────────┘
                            │
           mysql2 Connection Pool (SSL Enabled)
                            ▼
┌────────────────────────────────────────────────────────┐
│           CLOUD MYSQL 8.0+ DATABASE                    │
│   users • tickets • ticket_messages • knowledge_base   │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Bundler & Tooling**: Vite
- **Routing**: React Router v7 (SPA with Vercel rewrites)
- **HTTP Client**: Axios with Bearer JWT interceptors
- **Styling**: Pure Modular CSS with CSS Custom Properties / Tokens

### Backend
- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Authentication**: JSON Web Tokens (JWT) + bcrypt password hashing
- **Database Driver**: `mysql2/promise` with auto-reconnection & SSL support
- **CORS**: Configured for cross-origin cloud requests

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System and database health status |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns JWT token |
| `POST` | `/api/auth/register` | Public | Registers a new customer account |
| `GET` | `/api/tickets` | Protected | Returns tickets list (filtered for Customer or all for Admin) |
| `POST` | `/api/tickets` | Protected | Creates a new support ticket with resolution purpose |
| `GET` | `/api/tickets/:id` | Protected | Returns ticket details, messages thread, and action plan |
| `PUT` | `/api/tickets/:id/purpose` | Protected | Assigns or updates resolution purpose & checklist milestones |
| `PUT` | `/api/tickets/:id/status` | Protected | Updates ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) |
| `PUT` | `/api/tickets/bulk-status` | Protected | Bulk updates multiple tickets simultaneously |
| `POST` | `/api/tickets/:id/messages`| Protected | Appends a new message to the ticket thread |
| `POST` | `/api/tickets/:id/rating` | Protected | Submits customer satisfaction rating & feedback |
| `GET` | `/api/kb` | Public | Returns knowledge base articles |

---

## 💻 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/gajulagayathri311-arch/VerdantCare-Customer-Support-System.git
cd VerdantCare-Customer-Support-System
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Configure Frontend
```bash
cd ../frontend1
npm install
npm run dev
```

Visit `http://localhost:5173` to explore locally!
