import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ticketService, RESOLUTION_PURPOSES } from "../services/ticketService";
import { useAuth } from "../context/AuthContext";
import TicketTimeline from "../components/TicketTimeline";

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Rating state
  const [ratingStars, setRatingStars] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const loadTicket = useCallback(async () => {
    try {
      const data = await ticketService.getTicketById(id);
      setTicket(data);
      if (data.rating) {
        setRatingSubmitted(true);
        setRatingStars(data.rating);
        setFeedbackComment(data.ratingFeedback || "");
      }
    } catch {
      alert("Ticket could not be found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    try {
      const isAgent = user?.role === "ADMIN";
      await ticketService.addMessage(id, {
        sender: user?.name || (isAgent ? "Alex Mercer (Support)" : "Sarah Jenkins"),
        senderRole: user?.role || "CUSTOMER",
        avatar: isAgent ? "AM" : "SJ",
        text: replyText.trim()
      });

      setReplyText("");
      await loadTicket();
    } catch {
      alert("Unable to send reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await ticketService.updateStatus(id, newStatus);
      await loadTicket();
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await ticketService.submitRating(id, ratingStars, feedbackComment);
      setRatingSubmitted(true);
      await loadTicket();
    } catch {
      alert("Unable to submit feedback.");
    }
  };

  const handleToggleStep = async (stepIndex) => {
    try {
      await ticketService.toggleActionStep(id, stepIndex);
      await loadTicket();
    } catch {
      alert("Failed to update step progress.");
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper animate-fade-in">
        <div className="loading">Retrieving ticket history and conversation...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page-wrapper animate-fade-in">
        <div className="empty-message">
          <h2>Ticket Not Found</h2>
          <p>The requested ticket could not be located in our system.</p>
          <div style={{ marginTop: "16px" }}>
            <Link to="/my-tickets" className="btn-primary">
              Return to My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const purposeName = ticket.resolutionPurpose || "General Triage & Investigation";
  const preset = RESOLUTION_PURPOSES.find((p) => p.name === purposeName);
  const purposeIcon = preset ? preset.icon : "🎯";
  const plan = ticket.resolutionPlan || [];
  const completedSteps = plan.filter((s) => s.completed).length;
  const totalSteps = plan.length;
  const stepPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
        <Link to="/customer-dashboard">Dashboard</Link>
        <span>/</span>
        <Link to="/my-tickets">My Tickets</Link>
        <span>/</span>
        <span style={{ color: "var(--olive-900)", fontWeight: 700 }}>#{ticket.id}</span>
      </div>

      {/* Ticket Header Card */}
      <div className="card-surface" style={{ padding: "28px 32px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div className="ticket-meta-col">
              <span className="ticket-id-tag">#{ticket.id}</span>
              <span className={`badge-status badge-${ticket.status.toLowerCase()}`}>
                {ticket.status.replace("_", " ")}
              </span>
              <span className={`badge-priority priority-${ticket.priority.toLowerCase()}`}>
                {ticket.priority} Priority
              </span>
              <span style={{ fontSize: "12px", background: "var(--beige-200)", padding: "2px 8px", borderRadius: "4px" }}>
                {ticket.category}
              </span>
            </div>

            <h1 style={{ fontSize: "26px", color: "var(--olive-950)", margin: "10px 0 6px" }}>
              {ticket.subject}
            </h1>

            <div style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <span>Submitted by: <strong>{ticket.user?.name || "Customer"}</strong></span>
              <span>•</span>
              <span>Assigned: <strong>{ticket.assignedTo || "Support Specialist"}</strong></span>
              <span>•</span>
              <span>Date: <strong>{new Date(ticket.createdAt).toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Quick status actions for Admin/Agents */}
          {user?.role === "ADMIN" && (
            <div style={{ background: "var(--olive-50)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--olive-200)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--olive-800)", marginBottom: "6px" }}>
                Agent Controls:
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleStatusChange("IN_PROGRESS")}
                  disabled={ticket.status === "IN_PROGRESS"}
                >
                  Set In Progress
                </button>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => handleStatusChange("RESOLVED")}
                  disabled={ticket.status === "RESOLVED"}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Visual Progress Timeline */}
        <div style={{ marginTop: "24px" }}>
          <TicketTimeline status={ticket.status} />
        </div>
      </div>

      {/* Assigned Resolution Purpose & Purpose-Driven Action Plan Card */}
      <div className="card-surface" style={{ padding: "24px 28px", marginBottom: "24px", borderLeft: "4px solid var(--olive-600)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="purpose-badge purpose-badge-lg">
              <span className="purpose-badge-icon">{purposeIcon}</span>
              <span>Assigned Resolution Purpose: <strong>{purposeName}</strong></span>
            </span>
            <span style={{ fontSize: "12.5px", background: "var(--olive-100)", color: "var(--olive-900)", padding: "4px 10px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
              ⏱️ Target SLA: {ticket.targetResolutionDate || "Within 24 Hours"}
            </span>
          </div>

          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Specialist in Charge: <strong>{ticket.assignedTo || "Support Lead"}</strong>
          </div>
        </div>

        {ticket.resolutionNotes && (
          <div style={{ fontSize: "13.5px", color: "var(--text-body)", marginBottom: "14px", background: "var(--beige-100)", padding: "10px 16px", borderRadius: "var(--radius-md)" }}>
            <strong>Resolution Objective:</strong> {ticket.resolutionNotes}
          </div>
        )}

        {totalSteps > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, color: "var(--olive-950)", marginBottom: "4px" }}>
              <span>Action Plan Progress:</span>
              <span>{completedSteps} of {totalSteps} Steps Executed ({stepPercent}%)</span>
            </div>
            <div className="purpose-progress-wrap">
              <div className="purpose-progress-track">
                <div className="purpose-progress-fill" style={{ width: `${stepPercent}%` }}></div>
              </div>
            </div>

            <div className="purpose-checklist-box" style={{ marginTop: "12px" }}>
              {plan.map((step, idx) => (
                <div key={step.id || idx} className={`purpose-step-item ${step.completed ? "completed" : ""}`}>
                  <label style={{ display: "flex", alignItems: "center", cursor: user?.role === "ADMIN" ? "pointer" : "default", margin: 0, textTransform: "none" }}>
                    <input
                      type="checkbox"
                      className="purpose-step-checkbox"
                      checked={!!step.completed}
                      disabled={user?.role !== "ADMIN"}
                      onChange={() => handleToggleStep(idx)}
                    />
                    <span>{step.text}</span>
                  </label>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: step.completed ? "#16a34a" : "var(--olive-600)" }}>
                    {step.completed ? "✓ Completed" : (user?.role === "ADMIN" ? "Click to Mark Done" : "In Progress")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Conversation Thread */}
      <div className="card-surface" style={{ padding: "28px 32px" }}>
        <div className="card-header-flex">
          <div>
            <h2 className="card-title-lg">Support Discussion Thread</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Real-time collaboration between customer and support agents
            </p>
          </div>
          <span style={{ fontSize: "12px", color: "var(--olive-700)", fontWeight: 600 }}>
            {ticket.messages?.length || 1} messages logged
          </span>
        </div>

        {/* Message List */}
        <div className="conversation-messages-list">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg) => {
              const isCustomerMsg = msg.senderRole === "CUSTOMER";
              return (
                <div
                  key={msg.id}
                  className={`message-bubble-row ${isCustomerMsg ? "customer-msg" : ""}`}
                >
                  <div className="msg-avatar">{msg.avatar || "CU"}</div>
                  <div className="msg-body-box">
                    <div className="msg-header">
                      <span className="msg-sender-name">
                        {msg.sender} {msg.senderRole === "ADMIN" && "🛡️ (Staff)"}
                      </span>
                      <span className="msg-timestamp">{msg.timestamp}</span>
                    </div>
                    <div className="msg-text-content">{msg.text}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="message-bubble-row">
              <div className="msg-avatar">CU</div>
              <div className="msg-body-box">
                <div className="msg-header">
                  <span className="msg-sender-name">{ticket.user?.name || "Customer"}</span>
                  <span className="msg-timestamp">Initial Submission</span>
                </div>
                <div className="msg-text-content">{ticket.description}</div>
              </div>
            </div>
          )}
        </div>

        {/* Post New Message Form */}
        <form onSubmit={handleSendReply} style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
          <label htmlFor="reply-box" style={{ marginBottom: "6px" }}>
            Post a Reply / Provide Additional Information
          </label>
          <textarea
            id="reply-box"
            placeholder="Type your message, questions, or updates here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            style={{ minHeight: "100px", marginBottom: "12px" }}
            required
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-primary" disabled={isSending}>
              {isSending ? "Sending Reply..." : "Send Message →"}
            </button>
          </div>
        </form>
      </div>

      {/* Customer Satisfaction Rating Section (Visible when Resolved or for review) */}
      {(ticket.status === "RESOLVED" || ticket.status === "CLOSED" || ratingSubmitted) && (
        <div
          className="card-surface"
          style={{
            marginTop: "24px",
            backgroundColor: "var(--olive-50)",
            borderColor: "var(--olive-300)",
            padding: "28px 32px"
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <span style={{ fontSize: "28px" }}>⭐</span>
            <h3 style={{ fontSize: "20px", color: "var(--olive-950)", margin: "6px 0" }}>
              {ratingSubmitted ? "Thank You for Your Feedback!" : "How Was Your Support Experience?"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-body)", marginBottom: "16px" }}>
              {ratingSubmitted
                ? "Your review helps our customer satisfaction team continuously improve support quality."
                : "Your issue has been marked as resolved. Please take a brief moment to rate our service."}
            </p>

            {ratingSubmitted ? (
              <div style={{ background: "var(--surface-white)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--olive-200)" }}>
                <div style={{ fontSize: "22px", color: "#d97706", marginBottom: "6px" }}>
                  {"★".repeat(ticket.rating || ratingStars)}
                  {"☆".repeat(5 - (ticket.rating || ratingStars))}
                </div>
                <div style={{ fontStyle: "italic", color: "var(--text-main)", fontSize: "14px" }}>
                  "{ticket.ratingFeedback || feedbackComment || "Prompt and helpful resolution!"}"
                </div>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit}>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "12px 0 16px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingStars(star)}
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: "28px",
                        cursor: "pointer",
                        color: star <= ratingStars ? "#d97706" : "#cbd5e1",
                        padding: 0
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Share any comments about how our team handled your request..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  style={{ marginBottom: "12px" }}
                />

                <button type="submit" className="btn-primary">
                  Submit Rating & Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}