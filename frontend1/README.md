# VerdantCare — Customer Support Management System with Integrated AI Assistant

A modern, responsive, full-featured Customer Support Management platform designed with an elegant **Warm Beige and Olive Green** palette and an **Integrated 24/7 AI Support Copilot**.

Built with **React 19**, **Vite**, and **React Router v7**.

---

## 🎨 Theme & Aesthetic: Beige and Olive Green
- **Olive Green Brand Accents**:
  - Deep Forest Olive: `#1c2715`, `#26351d`, `#354728`
  - Olive Primary / Action Buttons: `#465c35`, `#567142`
  - Olive Light / Badges: `#e8f0df`, `#d4e2c7`
- **Warm Beige & Linen Palette**:
  - Warm Canvas Background: `#fbf9f5`, `#f7f3ec`
  - Crisp Surfaces: `#ffffff`
  - Sand Borders: `#e3dcce`, `#ddd4c5`

---

## 🤖 Integrated AI Support Copilot (OliveAI)
- **24/7 Floating Assistant Widget**: Accessible from every page with real-time intent recognition and quick chips.
- **Automated Issue Triage**: Diagnoses Billing, Account, Technical Glitches, and Service inquiries instantly.
- **1-Click Ticket Generation**: Customers can convert any AI conversation directly into an active support ticket.
- **AI Problem Enhancer**: Structures vague customer descriptions into standardized bug reports and environment telemetry.
- **AI Agent Response Drafter**: Generates empathetic, professional resolution drafts for support agents with one click.

---

## 🌟 Key Features

### 👤 Customer Experience
1. **Interactive Home Page**: Quick search bar that directly drafts support tickets, 3-step resolution guide, and service guarantees.
2. **Customer Dashboard**: Overview of inquiry metrics (Open, In Progress, Resolved), active ticket tracker, and quick-action cards.
3. **Problem Submission Form (Create Ticket)**:
   - Category (Technical, Billing, Account, Service Delivery, Feature Request).
   - Priority Selector (Low, Medium, High).
   - "✨ Enhance with AI Assistant" button.
   - Attachment uploader simulation.
   - Diagnostic telemetry option.
4. **My Tickets & Tracking**: Filter by Status tabs, filter by Category, live search, and detailed ticket cards.
5. **Interactive Ticket Discussion Thread**:
   - Visual 4-stage progression timeline (Submitted ➔ Under Review ➔ In Progress ➔ Resolved).
   - Real-time conversation thread between customer and support specialists.
   - Post follow-up messages and replies.
   - 5-Star satisfaction rating and review system upon resolution.
6. **Self-Service Help Center & Knowledge Base**: Searchable FAQ guides with category pills and helpfulness voting.

### 🛡️ Support Agent & Admin Experience
1. **Operations Analytics Dashboard**: SLA tracking (average 14 min first response), CSAT score, category distribution graphs, and queue alerts.
2. **Agent Workbench (Manage Tickets)**:
   - Queue management with status filters and priority tags.
   - Change ticket status (Open, In Progress, Resolved).
   - Generate AI resolution response drafts and reply directly in the thread.

### ⚡ Seamless Testing & Demo Switcher
- One-click role switcher in the navbar to toggle between:
  - **Sarah Jenkins (Customer)**
  - **Alex Mercer (Support Specialist / Admin)**
- Resilient dual-layer architecture: Connects to backend API (`http://localhost:8080/api`) if running, and automatically falls back to persistent `localStorage` with pre-seeded sample data.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AIAssistantWidget.jsx   # 24/7 Floating AI Copilot with 1-click ticket generation
│   ├── Footer.jsx              # Beige & Olive footer with SLA status
│   ├── Navbar.jsx              # Header with logo, role switcher, and user pill
│   ├── ProtectedRoute.jsx      # Role-based route guard
│   └── TicketTimeline.jsx      # Visual 4-step progress timeline
├── context/
│   └── AuthContext.jsx         # Role management and demo switcher
├── pages/
│   ├── AdminDashboard.jsx      # Staff operations & SLA analytics
│   ├── CreateTicket.jsx        # Ticket submission with AI enhancer & attachments
│   ├── CustomerDashboard.jsx   # Customer overview with stats & recent tickets
│   ├── Home.jsx                # Modern landing page with quick ticket launcher
│   ├── KnowledgeBase.jsx       # Searchable guides with helpful voting
│   ├── Login.jsx               # Sign in with fast demo access
│   ├── ManageTickets.jsx       # Staff ticket workbench with AI reply drafter
│   ├── MyTickets.jsx           # Customer ticket history with filters
│   ├── NotFound.jsx            # 404 page
│   ├── Register.jsx            # Registration with role selection
│   └── TicketDetails.jsx       # Discussion thread, timeline, and 5-star rating
├── services/
│   ├── aiService.js            # AI triage, problem enhancer, and agent drafter
│   ├── api.js                  # Axios configuration
│   └── ticketService.js        # Resilient ticket & KB storage service
├── styles/                     # CSS stylesheets with Beige & Olive Green palette
│   ├── Dashboard.css
│   ├── Login.css
│   ├── Navbar.css
│   └── Ticket.css
├── App.css                     # Comprehensive beige & olive green component styles
├── App.jsx                     # Route architecture & global AI widget
├── index.css                   # Global CSS design tokens and base styles
└── main.jsx                    # Application entry point
```
