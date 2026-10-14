// Ticket & Knowledge Base Data Service
// Integrates with MySQL backend API (http://localhost:8080/api) with resilient LocalStorage fallback
import API from "./api";

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
    text: "Hello,\n\nWe have inspected your transaction logs and confirmed the billing discrepancy. A full refund of the duplicate charge has been authorized and dispatched to your original payment card. It will reflect on your statement within 2-4 business days.\n\nPlease let us know if we can assist with anything else!\n\nBest regards,\nVerdantCare Billing Team"
  },
  {
    id: "tpl-2",
    label: "Request Diagnostic Screenshots",
    text: "Hello,\n\nThank you for alerting us to this issue. To help our engineering team diagnose the root cause quickly, could you please reply with:\n1. A screenshot of the exact error message or console log\n2. The URL / page you were on when this occurred\n3. Whether hard refreshing (Ctrl+F5) temporarily cleared it\n\nWe will hold this ticket open for your reply!\n\nBest regards,\nTechnical Support Team"
  },
  {
    id: "tpl-3",
    label: "Patch Deployed / Issue Resolved",
    text: "Hello,\n\nOur engineering team has deployed a hotfix addressing this problem across production servers. The issue is now completely resolved.\n\nPlease refresh your application and verify that everything functions as expected. If all looks good, feel free to mark this ticket as resolved and share your feedback!\n\nWarm regards,\nSupport Engineering Team"
  },
  {
    id: "tpl-4",
    label: "Password & 2FA Recovery",
    text: "Hello,\n\nWe have temporarily cleared the rate-limit flag on your account and triggered a manual password reset invitation to your registered address. Please check your inbox (and spam/promotions folder) within 5 minutes.\n\nBest regards,\nIdentity & Security Team"
  }
];

export const RESOLUTION_PURPOSES = [
  {
    id: "rp-refund",
    name: "Refund & Financial Adjustment",
    icon: "💳",
    category: "Billing",
    slaHours: 24,
    description: "Audit ledger discrepancy, reverse duplicate/unauthorized charge, and issue merchant credit.",
    defaultSteps: [
      { text: "Verify transaction reference in payment gateway ledger", completed: true },
      { text: "Authorize Stripe / merchant refund & reversal", completed: true },
      { text: "Dispatch PDF credit memo receipt to customer", completed: false },
      { text: "Confirm banking settlement with customer", completed: false }
    ]
  },
  {
    id: "rp-bugfix",
    name: "Root-Cause Investigation & Code Hotfix",
    icon: "🐛",
    category: "Technical",
    slaHours: 12,
    description: "Inspect stack trace, reproduce in staging, deploy hotfix patch, and verify stability.",
    defaultSteps: [
      { text: "Inspect server error logs & reproduce issue in staging", completed: true },
      { text: "Develop and test code patch locally", completed: true },
      { text: "Deploy hotfix release to production environment", completed: true },
      { text: "Verify fix with customer and monitor telemetry", completed: true }
    ]
  },
  {
    id: "rp-security",
    name: "Account Security & Access Recovery",
    icon: "🔐",
    category: "Account",
    slaHours: 4,
    description: "Verify identity, flush locked 2FA state, issue temporary passkey, and re-secure login.",
    defaultSteps: [
      { text: "Verify customer identity via secondary verified channel", completed: false },
      { text: "Clear failed 2FA session locks & flush SMS queue", completed: false },
      { text: "Generate secure time-limited recovery passcode", completed: false },
      { text: "Guide customer to set up new authenticator device", completed: false }
    ]
  },
  {
    id: "rp-performance",
    name: "Performance & Latency Optimization",
    icon: "⚡",
    category: "Technical",
    slaHours: 24,
    description: "Profile database queries, purge edge cache, and tune asset delivery pipeline.",
    defaultSteps: [
      { text: "Capture network HAR waterfall and server CPU metrics", completed: false },
      { text: "Purge stale edge CDN cache and tune database indexes", completed: false },
      { text: "Benchmark endpoint response latency under load", completed: false },
      { text: "Verify UI fluid rendering across customer browsers", completed: false }
    ]
  },
  {
    id: "rp-walkthrough",
    name: "Guided Onboarding & Feature Walkthrough",
    icon: "📖",
    category: "Service",
    slaHours: 48,
    description: "Provide step-by-step guidance, link relevant documentation, and ensure user success.",
    defaultSteps: [
      { text: "Identify customer specific workflow requirement", completed: true },
      { text: "Prepare annotated screenshots / walkthrough instructions", completed: false },
      { text: "Recommend relevant Knowledge Base reference article", completed: false },
      { text: "Follow up to ensure user successfully achieved objective", completed: false }
    ]
  },
  {
    id: "rp-retention",
    name: "VIP Retention & Customer Goodwill",
    icon: "🌟",
    category: "Retention",
    slaHours: 8,
    description: "Senior manager outreach, service goodwill credits, and dedicated remediation.",
    defaultSteps: [
      { text: "Personal outreach by Senior Support Lead", completed: false },
      { text: "Apply service goodwill discount or billing credit", completed: false },
      { text: "Set elevated priority monitoring on customer account", completed: false },
      { text: "Conduct post-resolution satisfaction check-in", completed: false }
    ]
  },
  {
    id: "rp-triage",
    name: "General Triage & Investigation",
    icon: "🔍",
    category: "General",
    slaHours: 24,
    description: "Initial intake diagnostic, specialist routing, and preliminary requirements gathering.",
    defaultSteps: [
      { text: "Review problem description and environment telemetry", completed: false },
      { text: "Assign issue to designated department specialist", completed: false },
      { text: "Establish expected SLA timeline with customer", completed: false }
    ]
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
    description: "I noticed on my bank statement that Invoice #INV-9204 was debited twice at 04:15 AM today. Kindly check and process the refund for the duplicate transaction.",
    userId: 101,
    user: {
      id: 101,
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com"
    },
    assignedTo: "Alex Mercer (Billing Lead)",
    resolutionPurpose: "Refund & Financial Adjustment",
    resolutionPlan: [
      { id: 1, text: "Verify transaction reference in payment gateway ledger", completed: true },
      { id: 2, text: "Authorize Stripe / merchant refund & reversal", completed: true },
      { id: 3, text: "Dispatch PDF credit memo receipt to customer", completed: false },
      { id: 4, text: "Confirm banking settlement with customer", completed: false }
    ],
    resolutionNotes: "Duplicate debit of $120.00 confirmed on Invoice #INV-9204. Authorized merchant refund.",
    targetResolutionDate: "Within 24 Hours",
    sentiment: "Frustrated - High Urgency",
    needsCustomerReply: false,
    messages: [
      {
        id: "m-1",
        sender: "Sarah Jenkins",
        senderRole: "CUSTOMER",
        avatar: "SJ",
        timestamp: new Date(Date.now() - 3600000 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "I noticed on my bank statement that Invoice #INV-9204 was debited twice at 04:15 AM today. Kindly check and process the refund for the duplicate transaction."
      },
      {
        id: "m-2",
        sender: "Alex Mercer",
        senderRole: "ADMIN",
        avatar: "AM",
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Hello Sarah, thank you for alerting us! I've checked payment gateway logs and identified the duplicate charge from our merchant processor. I have initiated a refund of $120.00 back to your original payment method. It will reflect in 2-3 business days."
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
    description: "Whenever I click 'Send 2FA code', my mobile phone doesn't receive any text message. Carrier is T-Mobile. Please advise how I can reset my verification method.",
    userId: 101,
    user: {
      id: 101,
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com"
    },
    assignedTo: "Tier-1 Support Queue",
    resolutionPurpose: "Account Security & Access Recovery",
    resolutionPlan: [
      { id: 1, text: "Verify customer identity via secondary verified channel", completed: false },
      { id: 2, text: "Clear failed 2FA session locks & flush SMS queue", completed: false },
      { id: 3, text: "Generate secure time-limited recovery passcode", completed: false },
      { id: 4, text: "Guide customer to set up new authenticator device", completed: false }
    ],
    resolutionNotes: "T-Mobile SMS delivery delay flagged. Awaiting identity check.",
    targetResolutionDate: "Within 4 Hours",
    sentiment: "Concerned - Moderate",
    needsCustomerReply: false,
    messages: [
      {
        id: "m-1",
        sender: "Sarah Jenkins",
        senderRole: "CUSTOMER",
        avatar: "SJ",
        timestamp: new Date(Date.now() - 3600000 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Whenever I click 'Send 2FA code', my mobile phone doesn't receive any text message. Carrier is T-Mobile. Please advise how I can reset my verification method."
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
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    description: "Exporting analytics reports with more than 5,000 rows causes the browser tab to hang on Firefox v128. Works fine on Chromium.",
    userId: 101,
    user: {
      id: 101,
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com"
    },
    assignedTo: "David Vance (Frontend Engineer)",
    resolutionPurpose: "Root-Cause Investigation & Code Hotfix",
    resolutionPlan: [
      { id: 1, text: "Inspect server error logs & reproduce issue in staging", completed: true },
      { id: 2, text: "Develop and test code patch locally", completed: true },
      { id: 3, text: "Deploy hotfix release to production environment", completed: true },
      { id: 4, text: "Verify fix with customer and monitor telemetry", completed: true }
    ],
    resolutionNotes: "Hotfix deployed for stream chunk buffering in Firefox v128.",
    targetResolutionDate: "Resolved",
    sentiment: "Satisfied",
    needsCustomerReply: false,
    messages: [
      {
        id: "m-1",
        sender: "Sarah Jenkins",
        senderRole: "CUSTOMER",
        avatar: "SJ",
        timestamp: "2 days ago",
        text: "Exporting analytics reports with more than 5,000 rows causes the browser tab to hang on Firefox v128. Works fine on Chromium."
      },
      {
        id: "m-2",
        sender: "David Vance",
        senderRole: "ADMIN",
        avatar: "DV",
        timestamp: "Yesterday",
        text: "We deployed a hotfix addressing stream chunk buffering for Firefox. Please clear your cache and try exporting again. It now batches smoothly."
      },
      {
        id: "m-3",
        sender: "Sarah Jenkins",
        senderRole: "CUSTOMER",
        avatar: "SJ",
        timestamp: "Yesterday",
        text: "Confirmed! The CSV file downloaded within 3 seconds. Thank you so much for the quick patch!"
      }
    ],
    rating: 5,
    ratingFeedback: "Super fast technical resolution and direct communication!"
  }
];

const INITIAL_KB_ARTICLES = [
  {
    id: "kb-1",
    category: "Billing",
    title: "How to understand your monthly invoice & refund policy",
    summary: "Complete breakdown of subscription billings, tax deductions, and standard 14-day refund policy.",
    content: "All subscriptions renew automatically unless paused prior to the cycle date. If you observe any unexpected charge, our billing department offers a no-hassle 14-day refund window for erroneous charges or unutilized service credits.",
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
  console.warn(
    "Backend API note (falling back gracefully):",
    error.response?.data?.message || error.message
  );
}

export const ticketService = {
  DEFAULT_USERS,

  async getAllTickets() {
    try {
      const res = await API.get("/tickets");
      if (Array.isArray(res.data)) {
        saveLocalTickets(res.data);
        return res.data;
      }
      return readLocalTickets();
    } catch (error) {
      handleApiError(error);
      return readLocalTickets();
    }
  },

  async getUserTickets(userId) {
    try {
      const targetId = userId || 101;
      const res = await API.get(`/tickets/user/${targetId}`);
      if (Array.isArray(res.data)) {
        return res.data;
      }
      return readLocalTickets().filter(
        ticket =>
          !userId ||
          Number(ticket.userId) === Number(userId) ||
          Number(ticket.user?.id) === Number(userId)
      );
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
    try {
      const res = await API.post("/tickets", ticketData);
      if (res.data) {
        const all = readLocalTickets();
        all.unshift(res.data);
        saveLocalTickets(all);
        return res.data;
      }
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
      assignedTo: ticketData.assignedTo || "Tier-1 Triage Queue",
      resolutionPurpose: ticketData.resolutionPurpose || "General Triage & Investigation",
      resolutionPlan: ticketData.resolutionPlan || [
        { id: 1, text: "Review problem description and environment telemetry", completed: false },
        { id: 2, text: "Assign issue to designated department specialist", completed: false },
        { id: 3, text: "Establish expected SLA timeline with customer", completed: false }
      ],
      resolutionNotes: ticketData.resolutionNotes || null,
      targetResolutionDate: ticketData.targetResolutionDate || "Within 24 Hours",
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
      if (res.data) {
        const all = readLocalTickets();
        const updated = all.map(t =>
          String(t.id) === String(ticketId) ? { ...t, status: newStatus } : t
        );
        saveLocalTickets(updated);
        return res.data;
      }
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
    try {
      await API.put("/tickets/bulk-status", { ids: ticketIds, status: newStatus });
    } catch (error) {
      handleApiError(error);
    }

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

  async assignTicket(ticketId, assigneePayload) {
    const payload = typeof assigneePayload === "string" 
      ? { assignedTo: assigneePayload } 
      : assigneePayload;

    try {
      await API.put(`/tickets/${ticketId}/assign`, payload);
    } catch (error) {
      handleApiError(error);
    }

    const all = readLocalTickets();
    const updated = all.map(ticket =>
      String(ticket.id) === String(ticketId)
        ? {
            ...ticket,
            assignedTo: payload.assignedTo || ticket.assignedTo,
            resolutionPurpose: payload.resolutionPurpose || ticket.resolutionPurpose,
            resolutionPlan: payload.resolutionPlan || ticket.resolutionPlan,
            resolutionNotes: payload.resolutionNotes || ticket.resolutionNotes,
            targetResolutionDate: payload.targetResolutionDate || ticket.targetResolutionDate,
            updatedAt: new Date().toISOString()
          }
        : ticket
    );

    saveLocalTickets(updated);
    return updated.find(
      ticket => String(ticket.id) === String(ticketId)
    );
  },

  async assignResolutionPurpose(ticketId, purposeData) {
    try {
      const res = await API.put(`/tickets/${ticketId}/purpose`, purposeData);
      if (res.data) {
        // sync local cache
        const all = readLocalTickets();
        const updated = all.map(ticket =>
          String(ticket.id) === String(ticketId)
            ? {
                ...ticket,
                resolutionPurpose: purposeData.resolutionPurpose,
                resolutionPlan: purposeData.resolutionPlan,
                resolutionNotes: purposeData.resolutionNotes,
                assignedTo: purposeData.assignedTo || ticket.assignedTo,
                targetResolutionDate: purposeData.targetResolutionDate || ticket.targetResolutionDate,
                updatedAt: new Date().toISOString()
              }
            : ticket
        );
        saveLocalTickets(updated);
        return res.data;
      }
    } catch (error) {
      handleApiError(error);
    }

    const all = readLocalTickets();
    const updated = all.map(ticket =>
      String(ticket.id) === String(ticketId)
        ? {
            ...ticket,
            resolutionPurpose: purposeData.resolutionPurpose,
            resolutionPlan: purposeData.resolutionPlan,
            resolutionNotes: purposeData.resolutionNotes,
            assignedTo: purposeData.assignedTo || ticket.assignedTo,
            targetResolutionDate: purposeData.targetResolutionDate || ticket.targetResolutionDate,
            updatedAt: new Date().toISOString()
          }
        : ticket
    );

    saveLocalTickets(updated);
    return updated.find(ticket => String(ticket.id) === String(ticketId));
  },

  async toggleActionStep(ticketId, stepIndex) {
    const all = readLocalTickets();
    const target = all.find(ticket => String(ticket.id) === String(ticketId));
    if (!target || !target.resolutionPlan || !target.resolutionPlan[stepIndex]) return target;

    const newPlan = [...target.resolutionPlan];
    newPlan[stepIndex] = {
      ...newPlan[stepIndex],
      completed: !newPlan[stepIndex].completed
    };

    return await this.assignResolutionPurpose(ticketId, {
      resolutionPurpose: target.resolutionPurpose,
      resolutionPlan: newPlan,
      resolutionNotes: target.resolutionNotes,
      assignedTo: target.assignedTo,
      targetResolutionDate: target.targetResolutionDate
    });
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
      if (res.data) {
        return res.data;
      }
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
