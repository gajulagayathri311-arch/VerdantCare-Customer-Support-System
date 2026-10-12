import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketService } from "../services/ticketService";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketSearchCode, setTicketSearchCode] = useState("");
  const [searchError, setSearchError] = useState("");
  const [recentFilter, setRecentFilter] = useState("ALL");

  useEffect(() => {
    async function fetchTickets() {
      try {
        const data = await ticketService.getUserTickets(user?.id);
        setTickets(data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, [user]);

  const openTickets = tickets.filter((t) => t.status === "OPEN");
  const inProgressTickets = tickets.filter((t) => t.status === "IN_PROGRESS");
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED");
  const waitingOnCustomer = tickets.filter((t) => t.needsCustomerReply && t.status !== "RESOLVED");

  const handleTicketLookup = (e) => {
    e.preventDefault();
    setSearchError("");
    const clean = ticketSearchCode.trim().toUpperCase();
    if (!clean) return;

    const formatted = clean.startsWith("TCK-") ? clean : `TCK-${clean}`;
    const found = tickets.find((t) => t.id.toUpperCase() === formatted);

    if (found) {
      navigate(`/ticket/${found.id}`);
    } else {
      setSearchError(`Ticket "${clean}" was not found in your account.`);
    }
  };

  const filteredRecentTickets = tickets.filter((t) => {
    if (recentFilter === "OPEN") return t.status === "OPEN";
    if (recentFilter === "IN_PROGRESS") return t.status === "IN_PROGRESS";
    if (recentFilter === "RESOLVED") return t.status === "RESOLVED" || t.status === "CLOSED";
    return true;
  });

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Welcome Banner */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="hero-pill-badge">Customer Resolution Hub</span>
            <h1 style={{ fontSize: "32px", color: "var(--olive-950)", margin: "4px 0" }}>
              Welcome back, {user?.name || "Sarah Jenkins"}
            </h1>
            <p style={{ color: "var(--text-body)", fontSize: "14px" }}>
              Track active inquiries, collaborate in discussion threads, or open a new request for immediate triage.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/create-ticket" className="btn-primary">
              + Submit New Ticket
            </Link>
            <Link to="/knowledge-base" className="btn-secondary">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Alert if Agent replied and needs customer feedback */}
      {waitingOnCustomer.length > 0 && (
        <div
          style={{
            backgroundColor: "var(--olive-100)",
            border: "1.5px solid var(--olive-500)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 22px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>🔔</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--olive-950)", fontSize: "14.5px" }}>
                Response Waiting For Your Review ({waitingOnCustomer.length})
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-body)" }}>
                Our support specialist posted an update on #{waitingOnCustomer[0].id}. Please verify the resolution details.
              </div>
            </div>
          </div>
          <Link to={`/ticket/${waitingOnCustomer[0].id}`} className="btn-primary btn-sm">
            Review Ticket Now →
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="stats-grid-row">
        <div className="stat-card-box">
          <div className="stat-label-title">Total Inquiries</div>
          <div className="stat-num-value">{tickets.length}</div>
          <div className="stat-foot-note">Submitted by your account</div>
        </div>

        <div className="stat-card-box card-highlight-open">
          <div className="stat-label-title">Open Queue</div>
          <div className="stat-num-value">{openTickets.length}</div>
          <div className="stat-foot-note">Pending specialist assignment</div>
        </div>

        <div className="stat-card-box card-highlight-progress">
          <div className="stat-label-title">In Investigation</div>
          <div className="stat-num-value">{inProgressTickets.length}</div>
          <div className="stat-foot-note">Active engineering review</div>
        </div>

        <div className="stat-card-box card-highlight-resolved">
          <div className="stat-label-title">Resolved & Closed</div>
          <div className="stat-num-value">{resolvedTickets.length}</div>
          <div className="stat-foot-note">100% resolution success rate</div>
        </div>
      </div>

      {/* Quick Lookup Bar & AI Banner Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
        {/* Quick Ticket Lookup */}
        <div className="card-surface" style={{ padding: "24px", marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "20px" }}>🔍</span>
            <h3 style={{ fontSize: "17px", color: "var(--olive-950)", margin: 0 }}>
              Track Ticket by Reference #
            </h3>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-body)", marginBottom: "16px" }}>
            Enter your ticket code (e.g. <code>TCK-8421</code>) to jump straight into the timeline.
          </p>

          <form onSubmit={handleTicketLookup} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Enter Ticket ID..."
              value={ticketSearchCode}
              onChange={(e) => setTicketSearchCode(e.target.value)}
              style={{ fontSize: "13.5px", padding: "10px 14px", marginBottom: 0 }}
            />
            <button type="submit" className="btn-primary btn-sm" style={{ flexShrink: 0, padding: "0 18px" }}>
              Track
            </button>
          </form>

          {searchError && (
            <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "8px" }}>
              {searchError}
            </div>
          )}
        </div>

        {/* AI Copilot Quick Assist Banner */}
        <div className="ai-quick-banner" style={{ margin: 0 }}>
          <div className="ai-banner-content">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <span style={{ fontSize: "10.5px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "10px" }}>
                OliveAI Diagnostic
              </span>
            </div>
            <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>
              Have an urgent issue? Ask OliveAI
            </h3>
            <p style={{ fontSize: "12.5px" }}>
              Instant troubleshooting for refunds, password resets, and error codes.
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                const btn = document.querySelector(".ai-floating-trigger");
                if (btn) btn.click();
              }}
              className="btn-secondary"
              style={{ whiteSpace: "nowrap", fontSize: "13px", padding: "8px 14px" }}
            >
              Launch Chat
            </button>
          </div>
        </div>
      </div>

      {/* Recent Tickets Section with Filter Pills */}
      <div className="card-surface">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title-lg">Recent Tickets & Inquiries</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Real-time synchronization with customer care specialists
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="filter-tabs-pills">
              <button
                className={`filter-pill-btn ${recentFilter === "ALL" ? "active" : ""}`}
                onClick={() => setRecentFilter("ALL")}
              >
                All ({tickets.length})
              </button>
              <button
                className={`filter-pill-btn ${recentFilter === "OPEN" ? "active" : ""}`}
                onClick={() => setRecentFilter("OPEN")}
              >
                Open ({openTickets.length})
              </button>
              <button
                className={`filter-pill-btn ${recentFilter === "IN_PROGRESS" ? "active" : ""}`}
                onClick={() => setRecentFilter("IN_PROGRESS")}
              >
                In Progress ({inProgressTickets.length})
              </button>
              <button
                className={`filter-pill-btn ${recentFilter === "RESOLVED" ? "active" : ""}`}
                onClick={() => setRecentFilter("RESOLVED")}
              >
                Resolved ({resolvedTickets.length})
              </button>
            </div>

            <Link to="/my-tickets" className="btn-outline-olive btn-sm">
              Full History →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading your support tickets...</div>
        ) : filteredRecentTickets.length === 0 ? (
          <div className="empty-message">
            <h3>No tickets found in this view</h3>
            <p style={{ marginTop: "6px" }}>
              You have no active support tickets matching the filter.
            </p>
            <div style={{ marginTop: "16px" }}>
              <Link to="/create-ticket" className="btn-primary">
                Submit a Support Ticket
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {filteredRecentTickets.slice(0, 4).map((ticket) => (
              <div key={ticket.id} className="ticket-row-card">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ticket-meta-col">
                    <span className="ticket-id-tag">#{ticket.id}</span>
                    <span className={`badge-status badge-${ticket.status.toLowerCase()}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className={`badge-priority priority-${ticket.priority.toLowerCase()}`}>
                      {ticket.priority} Priority
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Category: {ticket.category}
                    </span>
                    {ticket.needsCustomerReply && (
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "10px" }}>
                        Action Required
                      </span>
                    )}
                  </div>

                  <Link to={`/ticket/${ticket.id}`} className="ticket-title-link">
                    {ticket.subject}
                  </Link>

                  <div className="ticket-desc-snippet">
                    {ticket.description}
                  </div>
                </div>

                <div className="ticket-time-col">
                  <div>Updated {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}</div>
                  <Link
                    to={`/ticket/${ticket.id}`}
                    className="btn-secondary btn-sm"
                    style={{ marginTop: "8px" }}
                  >
                    Open Thread →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}