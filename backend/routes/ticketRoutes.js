
import { Router } from "express";
import {
  getAllTickets,
  getUserTickets,
  getTicketById,
  createTicket,
  updateStatus,
  bulkUpdateStatus,
  assignTicket,
  addMessage,
  submitRating
} from "../controllers/ticketController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

// All ticket endpoints require a valid login token.
router.use(authenticateToken);

router.get("/", getAllTickets);
router.get("/user/:userId", getUserTickets);
router.get("/:id", getTicketById);
router.post("/", createTicket);
router.put("/bulk-status", bulkUpdateStatus);
router.put("/:id/status", updateStatus);
router.put("/:id/assign", assignTicket);
router.post("/:id/messages", addMessage);
router.post("/:id/rating", submitRating);

export default router;
