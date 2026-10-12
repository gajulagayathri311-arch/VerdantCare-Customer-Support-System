
import API from "./api";

// Ticket & Knowledge Base Data Service
// Connects to the backend API and uses LocalStorage
// as a fallback for non-authentication errors.

const STORAGE_KEYS = {
  TICKETS: "verdantcare_tickets",
  KB: "verdantcare_kb_articles"
};

const DEFAULT_USERS = {
  customer: {
    id: 101,
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    role: "CUSTOMER",
    avatar: "SJ"
  },
  admin: {
    id: 201,
    name: "Alex Mercer",
    email: "alex.mercer@verdantcare.com",
    role: "ADMIN",
    avatar: "AM"
  }
};

export const CANNED_TEMPLATES = [
  {
    id: "tpl-1",
    label: "Refund Processed",
    text: "Hello,\n\nWe have inspected your transaction logs and confirmed the billing discrepancy. A full refund has been authorized. It will reflect on your statement within 2-4 business days.\n\nBest regards,\nVerdantCare Billing Team"
  },
  {
    id: "tpl-2",
    label: "Request Diagnostic Screenshots",
    text: "Hello,\n\nTo help our engineering team diagnose the issue, please provide a screenshot of the error, the URL of the page, and whether refreshing the page helped.\n\nBest regards,\nTechnical Support Team"
  },
  {
    id: "tpl-3",
    label: "Patch Deployed / Issue Resolved",
    text: "Hello,\n\nOur engineering team has deployed a fix addressing this problem. Please refresh the application and verify that everything works as expected.\n\nBest regards,\nSupport Engineering Team"
  },
  {
    id: "tpl-4",
    label: "Password & 2FA Recovery",
    text: "Hello,\n\nPlease follow the password recovery instructions sent to your registered email address. Check your inbox and spam folder.\n\nBest regards,\nIdentity & Security Team"
  }
];

const INITIAL_TICKETS = [
  {
    id: "TCK-8421",
    subject: "Payment debited twice for annual subscription renewal",
    category: "Billing",
    priority: "High",
    status: "IN_PROGRESS",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    description: "I noticed on my bank statement that Invoice #INV-9204 was debited twice. Kindly check and process the refund.",
    userId: 101,
    user: {
      id: 101,
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com"
    },
    assignedTo: "Alex Mercer (Billing Lead)",
    sentiment: "Frustrated - High Urgency",
    needsCustomerReply: false,
    messages: [
      {
        id: "m-1",
        sender: "Sarah Jenkins",
        senderRole: "CUSTOMER",
        avatar: "SJ",
        timestamp: new Date(Date.now() - 3600000 * 5).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),
        text: "I noticed that my invoice was debited twice. Kindly check and process the refund."
      },
      {
        id: "m-2",
        sender: "Alex Mercer",
        senderRole: "ADMIN",
        avatar: "AM",
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),
        text: "Thank you for alerting us. Our team is checking the duplicate charge."
      }
    ],
    rating: null,
    ratingFeedback: null
  },
  {
    id: "TCK-8390",
    subject: "Two-Factor authentication code SMS not arriving",
    category: "Account",
    priority: "Medium",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    description: "My phone is not receiving the two-factor authentication code. Please help me reset my verification method.",
    userId: 101,
    user: {
      id: 101,
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com"
    },
    assignedTo: "Tier-1 Support Queue",
    sentiment: "Concerned - Moderate",
    needsCustomerReply: false,
    messages: [
      {
        id: "m-1",
        sender: "Sarah Jenkins",
        senderRole: "CUSTOMER",
        avatar: "SJ",
        timestamp: new Date(Date.now() - 3600000 * 12).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),
        text: "My phone is not receiving the two-factor authentication code. Please help."
      }
    ],
    rating: null,
    ratingFeedback: null
  },
  {
    id: "TCK-8105",
    subject: "Data Export CSV export freezes at 99% in Firefox",
    category: "Technical",
    priority: "Medium",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    description: "Exporting large analytics reports causes the browser tab to freeze in Firefox.",
    userId: 101,
    user: {
      id: 101,
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com"
    },
    assignedTo: "David Vance (Frontend Engineer)",
    sentiment: "Satisfied",
    needsCustomerReply: false,
    messages: [
      {
        id: "m-1",
        sender: "Sarah Jenkins",
        senderRole: "CUSTOMER",
        avatar: "SJ",
        timestamp: "2 days ago",
        text: "Exporting large reports causes the browser tab to freeze."
      },
      {
        id: "m-2",
        sender: "David Vance",
        senderRole: "ADMIN",
        avatar: "DV",
        timestamp: "Yesterday",
        text: "We deployed a fix. Please refresh and try exporting again."
      },
      {
        id: "m-3",
        sender: "Sarah Jenkins",
        senderRole: "CUSTOMER",
        avatar: "SJ",
        timestamp: "Yesterday",
        text: "The export now works. Thank you!"
      }
    ],
    rating: 5,
    ratingFeedback: "Fast technical resolution and clear communication."
  }
];

const INITIAL_KB_ARTICLES = [
  {
    id: "kb-1",
    category: "Billing",
    title: "How to understand your monthly invoice & refund policy",
    summary: "Information about subscription billing, invoices, and refunds.",
    content: "Subscriptions renew automatically unless paused before the renewal date. Contact the billing department if you notice an unexpected charge.",
    helpfulCount: 48,
    tags: ["billing", "invoice", "refund", "receipt", "charge", "payment", "money"]
  },
  {
    id: "kb-2",
    category: "Account",
    title: "Troubleshooting 2FA & Password Reset Delays",
    summary: "Steps to take if SMS or email verification codes are delayed.",
    content: "1. Verify network coverage.\n2. Check your email spam folder.\n3. Follow the account recovery instructions.",
    helpfulCount: 39,
    tags: ["2fa", "password", "security", "login", "reset", "code", "sms"]
  },
  {
    id: "kb-3",
    category: "Technical",
    title: "Optimizing browser cache & resolving portal loading issues",
    summary: "Troubleshooting browser caching and slow page loading.",
    content: "Press Ctrl+Shift+R on Windows or Cmd+Shift+R on Mac to perform a hard refresh.",
    helpfulCount: 62,
    tags: ["cache", "technical", "browser", "speed", "error", "500", "crash", "freeze"]
  },
  {
    id: "kb-4",
    category: "Service",
    title: "Service Level Agreement (SLA) & Response Times",
    summary: "Learn about support priorities and response times.",
    content: "Response times depend on issue priority and support availability. Contact support for details.",
    helpfulCount: 29,
    tags: ["sla", "response time", "policy", "hours", "delivery", "shipping", "courier"]
  }
];

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(
      STORAGE_KEYS.TICKETS,
      JSON.stringify(INITIAL_TICKETS)
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.KB)) {
    localStorage.setItem(
      STORAGE_KEYS.KB,
      JSON.stringify(INITIAL_KB_ARTICLES)
    );
  }
}

initializeStorage();

function readLocalTickets() {
  return JSON.parse(
    localStorage.getItem(STORAGE_KEYS.TICKETS) || "[]"
  );
}

function saveLocalTickets(tickets) {
  localStorage.setItem(
    STORAGE_KEYS.TICKETS,
    JSON.stringify(tickets)
  );
}

function handleApiError(error) {
  if (error.response?.status === 401) {
    throw error;
  }

  if (error.response?.status === 403) {
    throw error;
  }

  console.warn(
    "Backend request failed:",
    error.response?.data?.message || error.message
  );
}

export const ticketService = {
  DEFAULT_USERS,

  async getAllTickets() {
    try {
      const res = await API.get("/tickets");
      if (Array.isArray(res.data)) return res.data;
      return [];
    } catch (error) {
      handleApiError(error);
      return readLocalTickets();
    }
  },

  async getUserTickets(userId) {
    try {
      const res = await API.get(`/tickets/user/${userId}`);
      if (Array.isArray(res.data)) return res.data;
      return [];
    } catch (error) {
      handleApiError(error);
      return readLocalTickets().filter(
        ticket =>
          !userId ||
          Number(ticket.userId) === Number(userId) ||
          Number(ticket.user?.id) === Number(userId)
      );
    }
  },

  async getTicketById(ticketId) {
    try {
      const res = await API.get(`/tickets/${ticketId}`);
      if (res.data) return res.data;
    } catch (error) {
      handleApiError(error);
    }

    const found = readLocalTickets().find(
      ticket =>
        String(ticket.id).toLowerCase() ===
        String(ticketId).toLowerCase()
    );

    if (!found) throw new Error("Ticket not found");
    return found;
  },

  async createTicket(ticketData) {
    // Prefer the backend response when available.
    try {
      const res = await API.post("/tickets", ticketData);
      return res.data;
    } catch (error) {
      handleApiError(error);
    }

    const userId = ticketData.userId || 101;
    const user = ticketData.user || {
      id: userId,
      name: ticketData.userName || "Sarah Jenkins",
      email: ticketData.userEmail || "sarah.jenkins@example.com"
    };

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category || "General",
      priority: ticketData.priority || "Medium",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
      user,
      assignedTo: "Tier-1 Triage Queue",
      sentiment:
        ticketData.priority === "High"
          ? "Urgent Attention Needed"
          : "Standard Inquiry",
      needsCustomerReply: false,
      attachments: ticketData.attachments || [],
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: user.name,
          senderRole: "CUSTOMER",
          avatar: user.avatar || "CU",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }),
          text: ticketData.description
        }
      ],
      rating: null,
      ratingFeedback: null
    };

    const all = readLocalTickets();
    all.unshift(newTicket);
    saveLocalTickets(all);
    return newTicket;
  },

  async updateStatus(ticketId, newStatus) {
    try {
      const res = await API.put(
        `/tickets/${ticketId}/status`,
        { status: newStatus }
      );
      if (res.data) return res.data;
    } catch (error) {
      handleApiError(error);
    }

    const all = readLocalTickets();
    const updated = all.map(ticket =>
      String(ticket.id) === String(ticketId)
        ? {
            ...ticket,
            status: newStatus,
            updatedAt: new Date().toISOString()
          }
        : ticket
    );

    saveLocalTickets(updated);
    return updated.find(
      ticket => String(ticket.id) === String(ticketId)
    );
  },

  async bulkUpdateStatus(ticketIds, newStatus) {
    const all = readLocalTickets();
    const updated = all.map(ticket =>
      ticketIds.includes(ticket.id)
        ? {
            ...ticket,
            status: newStatus,
            updatedAt: new Date().toISOString()
          }
        : ticket
    );

    saveLocalTickets(updated);
    return updated;
  },

  async assignTicket(ticketId, assignee) {
    const all = readLocalTickets();
    const updated = all.map(ticket =>
      String(ticket.id) === String(ticketId)
        ? {
            ...ticket,
            assignedTo: assignee,
            updatedAt: new Date().toISOString()
          }
        : ticket
    );

    saveLocalTickets(updated);
    return updated.find(
      ticket => String(ticket.id) === String(ticketId)
    );
  },

  async deleteTicket(ticketId) {
    const all = readLocalTickets();
    saveLocalTickets(
      all.filter(ticket => String(ticket.id) !== String(ticketId))
    );
    return true;
  },

  async addMessage(ticketId, messageObj) {
    try {
      const res = await API.post(
        `/tickets/${ticketId}/messages`,
        messageObj
      );
      if (res.data) return res.data;
    } catch (error) {
      handleApiError(error);
    }

    const all = readLocalTickets();
    const updated = all.map(ticket => {
      if (String(ticket.id) !== String(ticketId)) return ticket;

      const isAgent = messageObj.senderRole === "ADMIN";

      return {
        ...ticket,
        updatedAt: new Date().toISOString(),
        needsCustomerReply: isAgent,
        messages: [
          ...(ticket.messages || []),
          {
            id: `m-${Date.now()}`,
            sender: messageObj.sender || "User",
            senderRole: messageObj.senderRole || "CUSTOMER",
            avatar: messageObj.avatar || (isAgent ? "AM" : "CU"),
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            }),
            text: messageObj.text
          }
        ]
      };
    });

    saveLocalTickets(updated);
    return updated.find(
      ticket => String(ticket.id) === String(ticketId)
    );
  },

  async submitRating(ticketId, rating, feedback) {
    try {
      const res = await API.post(
        `/tickets/${ticketId}/rating`,
        { rating, feedback }
      );
      if (res.data) return res.data;
    } catch (error) {
      handleApiError(error);
    }

    const all = readLocalTickets();
    const updated = all.map(ticket =>
      String(ticket.id) === String(ticketId)
        ? { ...ticket, rating, ratingFeedback: feedback }
        : ticket
    );

    saveLocalTickets(updated);
    return true;
  },

  getKnowledgeBase() {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEYS.KB) || "[]"
    );
  },

  searchKnowledge(query) {
    if (!query || query.trim().length < 2) return [];

    const q = query.toLowerCase().trim();

    return this.getKnowledgeBase()
      .filter(article =>
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.tags.some(
          tag => q.includes(tag) || tag.includes(q)
        )
      )
      .slice(0, 3);
  },

  voteArticle(articleId, isHelpful) {
    const all = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.KB) || "[]"
    );

    const updated = all.map(article =>
      article.id === articleId
        ? {
            ...article,
            helpfulCount: isHelpful
              ? article.helpfulCount + 1
              : Math.max(0, article.helpfulCount - 1)
          }
        : article
    );

    localStorage.setItem(
      STORAGE_KEYS.KB,
      JSON.stringify(updated)
    );

    return updated;
  }
};
