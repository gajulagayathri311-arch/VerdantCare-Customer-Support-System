import { getPool } from "../database/db.js";

// Helper to fetch messages and attachments for a ticket
async function populateTicketDetails(pool, ticket) {
  const [messages] = await pool.query(
    "SELECT id, sender_name AS sender, sender_role AS senderRole, avatar, message_text AS text, created_at AS timestamp FROM ticket_messages WHERE ticket_id = ? ORDER BY id ASC;",
    [ticket.id]
  );

  const [attachments] = await pool.query(
    "SELECT file_name FROM ticket_attachments WHERE ticket_id = ?;",
    [ticket.id]
  );

  return {
    ...ticket,
    user: {
      id: ticket.user_id,
      name: ticket.user_name || "Customer",
      email: ticket.user_email || "customer@example.com"
    },
    messages: messages.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    })),
    attachments: attachments.map((a) => a.file_name)
  };
}

export async function getAllTickets(req, res) {
  try {
    const pool = getPool();
    const [tickets] = await pool.query(`
      SELECT t.*, u.name AS user_name, u.email AS user_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC;
    `);

    const fullTickets = await Promise.all(
      tickets.map((ticket) => populateTicketDetails(pool, ticket))
    );

    res.json(fullTickets);
  } catch (error) {
    console.error("getAllTickets Error:", error);
    res.status(500).json({ message: "Failed to fetch tickets.", error: error.message });
  }
}

export async function getUserTickets(req, res) {
  try {
    const { userId } = req.params;
    const pool = getPool();

    const [tickets] = await pool.query(
      `SELECT t.*, u.name AS user_name, u.email AS user_email
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC;`,
      [userId]
    );

    const fullTickets = await Promise.all(
      tickets.map((ticket) => populateTicketDetails(pool, ticket))
    );

    res.json(fullTickets);
  } catch (error) {
    console.error("getUserTickets Error:", error);
    res.status(500).json({ message: "Failed to fetch user tickets.", error: error.message });
  }
}

export async function getTicketById(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT t.*, u.name AS user_name, u.email AS user_email
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = ? LIMIT 1;`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const fullTicket = await populateTicketDetails(pool, rows[0]);
    res.json(fullTicket);
  } catch (error) {
    console.error("getTicketById Error:", error);
    res.status(500).json({ message: "Failed to fetch ticket.", error: error.message });
  }
}

export async function createTicket(req, res) {
  try {
    const {
      subject,
      description,
      category = "Technical",
      priority = "Medium",
      userId,
      userName = "Customer",
      userEmail = "customer@example.com",
      attachments = []
    } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: "Subject and description are required." });
    }

    const pool = getPool();
    const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const sentiment = priority === "High" ? "Urgent Attention Needed" : "Standard Inquiry";

    // 1. Insert into tickets
    await pool.query(
      `INSERT INTO tickets (id, user_id, subject, description, category, priority, status, assigned_to, sentiment)
       VALUES (?, ?, ?, ?, ?, ?, 'OPEN', 'Tier-1 Triage Queue', ?);`,
      [ticketId, userId || 101, subject, description, category, priority, sentiment]
    );

    // 2. Insert initial message into ticket_messages
    const avatar = userName.slice(0, 2).toUpperCase() || "CU";
    await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender_name, sender_role, avatar, message_text)
       VALUES (?, ?, 'CUSTOMER', ?, ?);`,
      [ticketId, userName, avatar, description]
    );

    // 3. Insert attachments if provided
    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const fileName of attachments) {
        await pool.query(
          "INSERT INTO ticket_attachments (ticket_id, file_name) VALUES (?, ?);",
          [ticketId, fileName]
        );
      }
    }

    const newTicket = {
      id: ticketId,
      userId: userId || 101,
      subject,
      description,
      category,
      priority,
      status: "OPEN",
      assignedTo: "Tier-1 Triage Queue",
      sentiment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: userId || 101,
        name: userName,
        email: userEmail
      },
      messages: [
        {
          id: 1,
          sender: userName,
          senderRole: "CUSTOMER",
          avatar,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: description
        }
      ],
      attachments
    };

    res.status(201).json(newTicket);
  } catch (error) {
    console.error("createTicket Error:", error);
    res.status(500).json({ message: "Failed to create ticket.", error: error.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const pool = getPool();
    await pool.query("UPDATE tickets SET status = ? WHERE id = ?;", [status, id]);

    res.json({ id, status, message: "Status updated successfully." });
  } catch (error) {
    console.error("updateStatus Error:", error);
    res.status(500).json({ message: "Failed to update status.", error: error.message });
  }
}

export async function bulkUpdateStatus(req, res) {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ message: "ids array and status are required." });
    }

    const pool = getPool();
    await pool.query("UPDATE tickets SET status = ? WHERE id IN (?);", [status, ids]);

    res.json({ count: ids.length, status, message: "Bulk status updated." });
  } catch (error) {
    console.error("bulkUpdateStatus Error:", error);
    res.status(500).json({ message: "Failed to bulk update status.", error: error.message });
  }
}

export async function assignTicket(req, res) {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: "assignedTo is required." });
    }

    const pool = getPool();
    await pool.query("UPDATE tickets SET assigned_to = ? WHERE id = ?;", [assignedTo, id]);

    res.json({ id, assignedTo, message: "Ticket reassigned successfully." });
  } catch (error) {
    console.error("assignTicket Error:", error);
    res.status(500).json({ message: "Failed to assign ticket.", error: error.message });
  }
}

export async function addMessage(req, res) {
  try {
    const { id } = req.params;
    const { sender, senderRole = "CUSTOMER", avatar = "CU", text } = req.body;

    if (!text || !sender) {
      return res.status(400).json({ message: "sender and text are required." });
    }

    const pool = getPool();
    const isAgent = senderRole === "ADMIN";

    const [msgResult] = await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender_name, sender_role, avatar, message_text)
       VALUES (?, ?, ?, ?, ?);`,
      [id, sender, senderRole, avatar, text]
    );

    // If agent replied, flag needs_customer_reply = true
    await pool.query(
      "UPDATE tickets SET needs_customer_reply = ?, updated_at = NOW() WHERE id = ?;",
      [isAgent, id]
    );

    const newMessage = {
      id: msgResult.insertId,
      sender,
      senderRole,
      avatar,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text
    };

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("addMessage Error:", error);
    res.status(500).json({ message: "Failed to add message.", error: error.message });
  }
}

export async function submitRating(req, res) {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "rating is required." });
    }

    const pool = getPool();
    await pool.query(
      "UPDATE tickets SET rating = ?, rating_feedback = ? WHERE id = ?;",
      [rating, feedback || null, id]
    );

    res.json({ id, rating, feedback, message: "Rating recorded successfully." });
  } catch (error) {
    console.error("submitRating Error:", error);
    res.status(500).json({ message: "Failed to submit rating.", error: error.message });
  }
}
