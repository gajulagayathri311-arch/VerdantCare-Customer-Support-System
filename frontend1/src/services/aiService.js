// AI Customer Support Assistant Service
// Provides intelligent triage, troubleshooting instructions, sentiment analysis, and ticket generation

export const KNOWLEDGE_TOPICS = [
  {
    keywords: ["billing", "charge", "refund", "invoice", "payment", "money", "deducted", "subscription", "price", "credit card"],
    category: "Billing",
    defaultPriority: "High",
    title: "Billing & Payment Inquiry",
    summary: "Customer experiencing payment or billing discrepancy.",
    solution: "1. Check your transaction history in Account > Billing.\n2. Incomplete or pending bank holds typically release automatically within 3–5 business days.\n3. If you were double-charged, provide your transaction reference number to request an immediate refund.\n4. We can fast-track this directly to our billing specialist team for you."
  },
  {
    keywords: ["password", "login", "sign in", "account", "locked", "email", "2fa", "two-factor", "verification", "access"],
    category: "Account",
    defaultPriority: "Medium",
    title: "Account Access & Authentication Issue",
    summary: "Customer unable to authenticate or access their profile.",
    solution: "1. Click 'Forgot Password' on the login screen and check your spam/junk folder for the reset link.\n2. Ensure your browser cookies and cache are cleared for the portal.\n3. If your account is locked due to too many attempts, wait 15 minutes or let us verify your registered email to unlock it immediately."
  },
  {
    keywords: ["bug", "error", "crash", "not working", "broken", "page", "500", "404", "freeze", "load", "slow", "api"],
    category: "Technical",
    defaultPriority: "High",
    title: "Technical Glitch / Bug Report",
    summary: "Customer reporting software error or performance issue.",
    solution: "1. Try hard-refreshing your browser (Ctrl + F5 or Cmd + Shift + R).\n2. Disable conflicting browser extensions (especially ad-blockers or aggressive script shields).\n3. Check if the issue occurs in an Incognito / Private window.\n4. Please provide any error code and screenshots in your ticket so our engineering team can reproduce and patch it quickly."
  },
  {
    keywords: ["delivery", "order", "shipping", "tracking", "package", "delayed", "courier", "received"],
    category: "Service",
    defaultPriority: "Medium",
    title: "Service Delivery & Shipping Status",
    summary: "Customer inquiring about order fulfillment or delivery timeline.",
    solution: "1. Orders are processed within 24-48 business hours.\n2. You can track your shipment using the tracking link emailed upon dispatch.\n3. If shipment hasn't moved in 4 days, our logistics coordinator will investigate with the courier immediately."
  },
  {
    keywords: ["feature", "request", "suggest", "improvement", "add", "idea"],
    category: "Feature Request",
    defaultPriority: "Low",
    title: "Customer Feature Request / Feedback",
    summary: "Customer proposing an enhancement or feature update.",
    solution: "Thank you for sharing your thoughtful idea! Our product development team reviews customer suggestions weekly. We've logged this in our roadmap queue."
  }
];

export const AI_QUICK_PROMPTS = [
  "How can I request a refund for a duplicated charge?",
  "I cannot log into my account or receive reset emails",
  "The application is crashing when uploading files",
  "How do I track my active ticket status?",
  "What are your live customer support hours?"
];

/**
 * Generate smart AI response for customer inquiry
 */
export function generateAIResponse(userMessage, _conversationHistory = []) {
  const query = userMessage.toLowerCase().trim();

  // Check for greetings
  if (/^(hi|hello|hey|good morning|good evening|greetings)\b/i.test(query) && query.length < 25) {
    return {
      text: "Hello! I am your **OliveCare AI Support Assistant**. I'm here 24/7 to help you resolve issues immediately, troubleshoot technical problems, or escalate your request directly to a support specialist.\n\nHow can I help you today? You can describe any problem or choose a topic below.",
      category: "General",
      priority: "Low",
      suggestedAction: null,
      canConvertToTicket: false
    };
  }

  // Check for hours or contact info
  if (query.includes("hours") || query.includes("contact") || query.includes("human") || query.includes("agent") || query.includes("call")) {
    return {
      text: "Our human support team is available **Monday through Friday, 8:00 AM – 8:00 PM EST**, with 24/7 on-call engineers for critical tier-1 emergencies.\n\nWould you like me to create an expedited support ticket right now so our senior agent reaches out to you directly?",
      category: "General",
      priority: "Medium",
      suggestedAction: "CREATE_TICKET",
      canConvertToTicket: true,
      ticketDraft: {
        subject: "Request to connect with human support specialist",
        category: "General",
        priority: "Medium",
        description: `Customer requested direct human agent support: "${userMessage}"`
      }
    };
  }

  // Match with knowledge topics
  for (const topic of KNOWLEDGE_TOPICS) {
    const hasMatch = topic.keywords.some(kw => query.includes(kw));
    if (hasMatch) {
      // Detect sentiment/urgency
      let priority = topic.defaultPriority;
      const urgentWords = ["urgent", "immediately", "emergency", "asap", "critical", "furious", "stuck", "money lost"];
      if (urgentWords.some(w => query.includes(w))) {
        priority = "High";
      }

      return {
        text: `I understand your concern regarding **${topic.title}**.\n\nHere is what you can do right away:\n\n${topic.solution}\n\n💡 *If this doesn't resolve your problem immediately, I can convert this conversation into an official support ticket with one click so our team can investigate your account.*`,
        category: topic.category,
        priority: priority,
        suggestedAction: "CREATE_TICKET",
        canConvertToTicket: true,
        ticketDraft: {
          subject: topic.title,
          category: topic.category,
          priority: priority,
          description: `Customer issue summary:\n"${userMessage}"\n\nAI Diagnostic Triage:\n${topic.solution}`
        }
      };
    }
  }

  // Fallback intelligent response
  return {
    text: `Thank you for sharing the details: *"userMessage"*\n\nI have analyzed your request. To ensure this gets resolved thoroughly by the appropriate department, I recommend opening a support ticket.\n\nOur team investigates all incoming tickets within an average of 15 minutes. Would you like me to draft and submit a ticket for this now?`,
    category: "General",
    priority: "Medium",
    suggestedAction: "CREATE_TICKET",
    canConvertToTicket: true,
    ticketDraft: {
      subject: `Inquiry regarding: ${userMessage.slice(0, 45)}...`,
      category: "Technical",
      priority: "Medium",
      description: userMessage
    }
  };
}

/**
 * AI Problem Enhancer: Polishes and clarifies customer problem descriptions for faster resolution
 */
export function enhanceProblemDescription(rawText, category = "Technical") {
  if (!rawText || rawText.trim().length < 5) return rawText;

  const cleaned = rawText.trim();
  const summaryHeader = `[ISSUE SUMMARY]\n${cleaned}\n\n`;
  const triageDetails = `[STEPS OBSERVED]\n- User reported unexpected behavior during standard operation.\n- Impact: User workflow impeded; awaiting support verification.\n\n`;
  const envHeader = `[ENVIRONMENT]\n- Platform: Web Application\n- Category: ${category}\n- Status: Pending Diagnostic Inspection`;

  return `${summaryHeader}${triageDetails}${envHeader}`;
}

/**
 * AI Response Drafter for Support Agents: Suggests professional response to tickets
 */
export function generateAgentReplyDraft(ticket) {
  const customerName = ticket.user?.name || "Valued Customer";
  const category = ticket.category || "General";
  const subject = ticket.subject || "your inquiry";

  return `Hello ${customerName},

Thank you for reaching out to VerdantCare Customer Support regarding "${subject}".

We have reviewed your inquiry concerning ${category.toLowerCase()} services. Our team is actively investigating the details you provided.

Next Steps:
1. Our technical specialist has logged the report in our internal queue.
2. We are verifying the logs and configurations associated with your profile.
3. We will post an updated status here within the next 2 hours or sooner.

If you have any supplementary screenshots or transaction references to share, please reply directly in this thread. We are committed to resolving this completely for you.

Warm regards,
Customer Success Specialist
VerdantCare Support Team`;
}
