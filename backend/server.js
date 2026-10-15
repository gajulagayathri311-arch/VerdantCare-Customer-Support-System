import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database/db.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import kbRoutes from "./routes/kbRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: "*", // Allows Vite dev server & other clients
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root & API welcome check
app.get(["/", "/api"], (req, res) => {
  res.json({
    status: "online",
    system: "VerdantCare Customer Support Management API",
    version: "1.0.0",
    database: "MySQL 8.0+",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      tickets: "/api/tickets",
      knowledgeBase: "/api/kb"
    },
    documentation: "https://github.com/gajulagayathri311-arch/VerdantCare-Customer-Support-System",
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    system: "VerdantCare Customer Support Management API",
    database: "MySQL 8.0+",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/kb", kbRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// Start Server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`
==========================================================
🌿 VerdantCare Customer Support Backend Server Online!
🚀 Running on: http://localhost:${PORT}
📡 API Endpoint: http://localhost:${PORT}/api
🗄️ Database: MySQL (${process.env.DB_NAME || "customer_support_db"})
==========================================================
      `);
    });
  } catch (error) {
    console.error("Failed to start server due to database initialization failure:", error.message);
  }
}

startServer();
