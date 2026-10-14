import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketService } from "../services/ticketService";

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastNotice, setToastNotice] = useState("");

  const loadUserTickets = useCallback(async () => {
    try {
      const data = await ticketService.getUserTickets(user?.id);
      setTickets(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserTickets();
  }, [loadUserTickets]);

  const handleQuickResolve = async (ticketId) => {
    try {
      await ticketService.updateStatus(ticketId, "RESOLVED");
      setToastNotice(`Ticket #${ticketId} marked as Resolved!`);
      setTimeout(() => setToastNotice(""), 3000);
      loadUserTickets();
    } catch {
      alert("Unable to update status.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Ticket ID", "Subject", "Category", "Priority", "Status", "Created At"];
    const rows = filteredTickets.map((t) => [
      t.id,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      new Date(t.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VerdantCare_Tickets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((t) => {
      if (activeTab === "OPEN" && t.status !== "OPEN") return false;
      if (activeTab === "IN_PROGRESS" && t.status !== "IN_PROGRESS") return false;
      if (activeTab === "RESOLVED" && !(t.status === "RESOLVED" || t.status === "CLOSED")) return false;
      if (activeTab === "ACTION_NEEDED" && !t.needsCustomerReply) return false;

      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = String(t.id).toLowerCase().includes(q);
        const matchSubject = t.subject.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchId && !matchSubject && !matchDesc) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "NEWEST") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "UPDATED") {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      if (sortBy === "PRIORITY") {
        const pOrder = { High: 3, Medium: 2, Low: 1 };
        return (pOrder[b.priority] || 1) - (pOrder[a.priority] || 1);
      }
      return 0;
    });

  const getStepNumber = (status) => {
    switch (status) {
      case "OPEN": return 1;
      case "IN_PROGRESS": return 2;
      case "RESOLVED":
      case "CLOSED": return 3;
      default: return 0;
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <span className="hero-pill-badge">Customer Tickets History</span>
          <h1 style={{ fontSize: "32px", color: "var(--olive-950)", margin: "4px 0" }}>
            My Support Requests
          </h1>
          <p style={{ color: "var(--text-body)", fontSize: "14px" }}>
            Monitor open inquiries, review specialist responses, and track your ticket progression.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleExportCSV} className="btn-secondary" title="Export tickets as CSV report">
            📥 Export CSV
          </button>
          <Link to="/create-ticket" className="btn-primary">
            + New Support Ticket
          </Link>
        </div>
      </div>

      {toastNotice && (
        <div
          style={{
            backgroundColor: "var(--olive-100)",
            border: "1px solid var(--olive-400)",
            color: "var(--olive-950)",
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
            fontWeight: 600
          }}
        >
          ✓ {toastNotice}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-surface" style={{ padding: "18px 24px", marginBottom: "24px" }}>
        <div className="filter-search-toolbar">
          {/* Status Tabs */}
          <div className="filter-tabs-pills">
            <button
              className={`filter-pill-btn ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              All ({tickets.length})
            </button>
            <button
              className={`filter-pill-btn ${activeTab === "OPEN" ? "active" : ""}`}
              onClick={() => setActiveTab("OPEN")}
            >
              Open ({tickets.filter((t) => t.status === "OPEN").length})
            </button>
            <button
              className={`filter-pill-btn ${activeTab === "IN_PROGRESS" ? "active" : ""}`}
              onClick={() => setActiveTab("IN_PROGRESS")}
            >
              In Progress ({tickets.filter((t) => t.status === "IN_PROGRESS").length})
            </button>
            <button
              className={`filter-pill-btn ${activeTab === "ACTION_NEEDED" ? "active" : ""}`}
              onClick={() => setActiveTab("ACTION_NEEDED")}
            >
              Action Needed ({tickets.filter((t) => t.needsCustomerReply).length})
            </button>
            <button
              className={`filter-pill-btn ${activeTab === "RESOLVED" ? "active" : ""}`}
              onClick={() => setActiveTab("RESOLVED")}
            >
              Resolved ({tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length})
            </button>
          </div>

          {/* Category, Sort, and Search Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: "auto", padding: "8px 12px", marginBottom: 0, fontSize: "13px" }}
            >
              <option value="ALL">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="Service">Service</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "auto", padding: "8px 12px", marginBottom: 0, fontSize: "13px" }}
            >
              <option value="NEWEST">Sort: Newest First</option>
              <option value="UPDATED">Sort: Recently Updated</option>
              <option value="PRIORITY">Sort: Highest Priority</option>
            </select>

            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search ticket # or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px 14px", marginBottom: 0, fontSize: "13px" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="loading">Retrieving your ticket catalog...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="empty-message">
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>📋</div>
          <h3 style={{ color: "var(--olive-950)" }}>No support tickets found</h3>
          <p style={{ marginTop: "6px" }}>
            No tickets match your selected filters or search keyword.
          </p>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              className="btn-secondary btn-sm"
              onClick={() => {
                setActiveTab("ALL");
                setCategoryFilter("ALL");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
            <Link to="/create-ticket" className="btn-primary btn-sm">
              Create New Ticket
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredTickets.map((ticket) => {
            const stepNum = getStepNumber(ticket.status);
            return (
              <div key={ticket.id} className="card-surface" style={{ padding: "24px 28px", marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <div className="ticket-meta-col">
                      <span className="ticket-id-tag">#{ticket.id}</span>
                      <span className={`badge-status badge-${ticket.status.toLowerCase()}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className={`badge-priority priority-${ticket.priority.toLowerCase()}`}>
                        {ticket.priority} Priority
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--beige-200)", padding: "2px 8px", borderRadius: "4px" }}>
                        {ticket.category}
                      </span>
                      {ticket.resolutionPurpose && (
                        <span className="purpose-badge" style={{ fontSize: "11px", padding: "2px 8px" }}>
                          🎯 {ticket.resolutionPurpose}
                        </span>
                      )}
                      {ticket.needsCustomerReply && (
                        <span style={{ fontSize: "11px", fontWeight: 700, background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "10px" }}>
                          Response Waiting For You
                        </span>
                      )}
                    </div>

                    <Link to={`/ticket/${ticket.id}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ fontSize: "18.5px", color: "var(--olive-950)", margin: "8px 0 6px" }}>
                        {ticket.subject}
                      </h3>
                    </Link>

                    <p style={{ fontSize: "13.5px", color: "var(--text-body)", lineHeight: "1.5", maxHeight: "44px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ticket.description}
                    </p>

                    {/* Mini Visual Step Progression */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "14px", padding: "8px 12px", backgroundColor: "var(--beige-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", maxWidth: "480px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--olive-900)" }}>Progress:</div>
                      <div style={{ display: "flex", gap: "6px", flex: 1 }}>
                        {["Submitted", "Investigating", "Resolved"].map((stepText, idx) => {
                          const isDone = idx + 1 <= stepNum;
                          return (
                            <div key={idx} style={{ flex: 1, textAlign: "center" }}>
                              <div style={{ height: "4px", backgroundColor: isDone ? "var(--olive-700)" : "var(--beige-300)", borderRadius: "2px", marginBottom: "3px" }}></div>
                              <span style={{ fontSize: "10px", color: isDone ? "var(--olive-950)" : "var(--text-muted)", fontWeight: isDone ? 700 : 500 }}>
                                {stepText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                      <span>💬 {ticket.messages?.length || 1} message{ticket.messages?.length !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span>Assigned: <strong>{ticket.assignedTo || "Support Team"}</strong></span>
                      <span>•</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <Link to={`/ticket/${ticket.id}`} className="btn-primary btn-sm">
                      Open Conversation Thread →
                    </Link>
                    {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => handleQuickResolve(ticket.id)}
                        style={{ fontSize: "12px" }}
                      >
                        ✓ Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}