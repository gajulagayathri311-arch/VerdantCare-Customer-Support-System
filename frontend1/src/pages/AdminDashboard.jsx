import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ticketService } from "../services/ticketService";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const data = await ticketService.getAllTickets();
        setTickets(data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
  const highPriorityCount = tickets.filter((t) => t.priority === "High").length;

  const categories = ["Technical", "Billing", "Account", "Service", "Feature Request"];

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <span className="hero-pill-badge">Staff & Operations Command</span>
          <h1 style={{ fontSize: "32px", color: "var(--olive-950)", margin: "4px 0" }}>
            Support Operations & Analytics
          </h1>
          <p style={{ color: "var(--text-body)", fontSize: "14px" }}>
            Operational metrics, ticket queue management, and service health overview for Agent {user?.name || "Alex Mercer"}.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/manage-tickets" className="btn-primary">
            Manage Ticket Queue ({openCount + inProgressCount}) →
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid-row">
        <div className="stat-card-box">
          <div className="stat-label-title">Queue Volume</div>
          <div className="stat-num-value">{tickets.length}</div>
          <div className="stat-foot-note">All customer tickets</div>
        </div>

        <div className="stat-card-box card-highlight-open">
          <div className="stat-label-title">Pending Triage</div>
          <div className="stat-num-value">{openCount}</div>
          <div className="stat-foot-note">Awaiting specialist assignment</div>
        </div>

        <div className="stat-card-box card-highlight-progress">
          <div className="stat-label-title">Active In-Progress</div>
          <div className="stat-num-value">{inProgressCount}</div>
          <div className="stat-foot-note">Investigation ongoing</div>
        </div>

        <div className="stat-card-box card-highlight-resolved">
          <div className="stat-label-title">Resolved Tickets</div>
          <div className="stat-num-value">{resolvedCount}</div>
          <div className="stat-foot-note">Closed with verified solutions</div>
        </div>
      </div>

      {/* SLA & Health Bar */}
      <div
        className="card-surface"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
          padding: "24px 30px",
          backgroundColor: "var(--beige-100)",
          marginBottom: "28px"
        }}
      >
        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Average First Response
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--olive-900)", marginTop: "4px" }}>
            14.2 Minutes
          </div>
          <div style={{ fontSize: "11px", color: "#16a34a" }}>✓ 98.2% within SLA target</div>
        </div>

        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            CSAT Rating
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--olive-900)", marginTop: "4px" }}>
            4.9 / 5.0 ★
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-body)" }}>Based on resolved customer reviews</div>
        </div>

        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            High Priority Alerts
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#dc2626", marginTop: "4px" }}>
            {highPriorityCount} Active
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Requires Tier-1 response</div>
        </div>

        <div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            AI Auto-Triage Rate
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--olive-700)", marginTop: "4px" }}>
            76.8%
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-body)" }}>Diagnosed by OliveAI Copilot</div>
        </div>
      </div>

      {/* Category Breakdown & Recent Queue */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Category breakdown */}
        <div className="card-surface" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "18px", color: "var(--olive-950)", marginBottom: "16px" }}>
            Category Distribution
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {categories.map((cat) => {
              const count = tickets.filter((t) => t.category === cat).length;
              const pct = tickets.length > 0 ? Math.round((count / tickets.length) * 100) : 0;
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: "var(--text-muted)" }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "var(--beige-200)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "var(--olive-600)" }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Tickets to action */}
        <div className="card-surface">
          <div className="card-header-flex">
            <div>
              <h3 style={{ fontSize: "18px", color: "var(--olive-950)" }}>
                Support Queue Quick Actions
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                Select a ticket to review customer details or reply with AI draft
              </p>
            </div>
            <Link to="/manage-tickets" className="btn-outline-olive btn-sm">
              Open Full Workbench →
            </Link>
          </div>

          {loading ? (
            <div className="loading">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="empty-message">No tickets in system.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tickets.slice(0, 4).map((ticket) => (
                <div key={ticket.id} className="ticket-row-card" style={{ padding: "14px 18px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ticket-meta-col">
                      <span className="ticket-id-tag">#{ticket.id}</span>
                      <span className={`badge-status badge-${ticket.status.toLowerCase()}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className={`badge-priority priority-${ticket.priority.toLowerCase()}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <Link to={`/ticket/${ticket.id}`} className="ticket-title-link" style={{ fontSize: "15px" }}>
                      {ticket.subject}
                    </Link>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Customer: {ticket.user?.name || "Customer"} ({ticket.user?.email || "customer@example.com"})
                    </div>
                  </div>
                  <Link to={`/ticket/${ticket.id}`} className="btn-secondary btn-sm">
                    Open →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}