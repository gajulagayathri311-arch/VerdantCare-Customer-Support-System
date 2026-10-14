import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ticketService, CANNED_TEMPLATES, RESOLUTION_PURPOSES } from "../services/ticketService";
import { generateAgentReplyDraft } from "../services/aiService";
import { useAuth } from "../context/AuthContext";

export default function ManageTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [purposeFilter, setPurposeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [actionNotice, setActionNotice] = useState("");

  // Purpose Assignment Modal State
  const [activePurposeTicket, setActivePurposeTicket] = useState(null);
  const [modalPurposeName, setModalPurposeName] = useState("");
  const [modalAssignedTo, setModalAssignedTo] = useState("");
  const [modalTargetDate, setModalTargetDate] = useState("Within 24 Hours");
  const [modalNotes, setModalNotes] = useState("");
  const [modalSteps, setModalSteps] = useState([]);
  const [newStepInput, setNewStepInput] = useState("");
  const [expandedChecklists, setExpandedChecklists] = useState({});

  const staffMembers = [
    "Alex Mercer (Lead Support)",
    "David Vance (Engineering)",
    "Elena Rostova (Billing Specialist)",
    "Tier-1 Triage Queue",
    "Tier-2 Escalations"
  ];

  const loadTickets = useCallback(async () => {
    try {
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch {
      alert("Unable to load ticket queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await ticketService.updateStatus(id, status);
      setActionNotice(`Ticket #${id} status updated to ${status.replace("_", " ")}`);
      setTimeout(() => setActionNotice(""), 3000);
      loadTickets();
    } catch {
      alert("Unable to update status.");
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await ticketService.bulkUpdateStatus(selectedIds, status);
      setActionNotice(`Updated ${selectedIds.length} tickets to ${status.replace("_", " ")}`);
      setSelectedIds([]);
      setTimeout(() => setActionNotice(""), 3000);
      loadTickets();
    } catch {
      alert("Bulk update failed.");
    }
  };

  const handleReassign = async (id, assignee) => {
    try {
      await ticketService.assignTicket(id, assignee);
      setActionNotice(`Ticket #${id} reassigned to ${assignee}`);
      setTimeout(() => setActionNotice(""), 3000);
      loadTickets();
    } catch {
      alert("Reassignment failed.");
    }
  };

  const toggleSelectTicket = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTickets.map((t) => t.id));
    }
  };

  const handleGenerateAIReply = (ticket) => {
    const draft = generateAgentReplyDraft(ticket);
    setReplyDrafts((prev) => ({
      ...prev,
      [ticket.id]: draft
    }));
  };

  const handleApplyTemplate = (ticketId, templateText) => {
    setReplyDrafts((prev) => ({
      ...prev,
      [ticketId]: templateText
    }));
  };

  const handleSendAgentReply = async (ticketId) => {
    const text = replyDrafts[ticketId]?.trim();
    if (!text) return;

    try {
      await ticketService.addMessage(ticketId, {
        sender: user?.name || "Alex Mercer",
        senderRole: "ADMIN",
        avatar: "AM",
        text: text
      });

      setReplyDrafts((prev) => {
        const copy = { ...prev };
        delete copy[ticketId];
        return copy;
      });

      setActionNotice(`Official reply sent to customer on #${ticketId}`);
      setTimeout(() => setActionNotice(""), 3000);
      loadTickets();
    } catch {
      alert("Failed to send reply.");
    }
  };

  // Open modal to assign/edit purpose
  const handleOpenPurposeModal = (ticket) => {
    setActivePurposeTicket(ticket);
    const existingPurpose = ticket.resolutionPurpose || "General Triage & Investigation";
    setModalPurposeName(existingPurpose);
    setModalAssignedTo(ticket.assignedTo || "Tier-1 Triage Queue");
    setModalTargetDate(ticket.targetResolutionDate || "Within 24 Hours");
    setModalNotes(ticket.resolutionNotes || "");

    if (ticket.resolutionPlan && ticket.resolutionPlan.length > 0) {
      setModalSteps([...ticket.resolutionPlan]);
    } else {
      // Find preset template default steps
      const preset = RESOLUTION_PURPOSES.find((p) => p.name === existingPurpose);
      if (preset) {
        setModalSteps(preset.defaultSteps.map((s, idx) => ({ id: idx + 1, text: s.text, completed: !!s.completed })));
      } else {
        setModalSteps([
          { id: 1, text: "Review description and diagnostic telemetry", completed: false },
          { id: 2, text: "Execute technical / billing resolution action", completed: false },
          { id: 3, text: "Verify successful outcome with customer", completed: false }
        ]);
      }
    }
  };

  const handleSelectPresetPurpose = (presetName) => {
    setModalPurposeName(presetName);
    const preset = RESOLUTION_PURPOSES.find((p) => p.name === presetName);
    if (preset) {
      setModalSteps(preset.defaultSteps.map((s, idx) => ({ id: idx + 1, text: s.text, completed: false })));
      setModalTargetDate(`Within ${preset.slaHours} Hours`);
      if (!modalNotes) {
        setModalNotes(preset.description);
      }
    }
  };

  const handleAddModalStep = () => {
    if (!newStepInput.trim()) return;
    setModalSteps((prev) => [
      ...prev,
      { id: Date.now(), text: newStepInput.trim(), completed: false }
    ]);
    setNewStepInput("");
  };

  const handleRemoveModalStep = (index) => {
    setModalSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePurposeModal = async () => {
    if (!activePurposeTicket) return;
    try {
      await ticketService.assignResolutionPurpose(activePurposeTicket.id, {
        resolutionPurpose: modalPurposeName,
        resolutionPlan: modalSteps,
        resolutionNotes: modalNotes,
        assignedTo: modalAssignedTo,
        targetResolutionDate: modalTargetDate
      });

      setActionNotice(`Resolution Purpose & Action Plan assigned to #${activePurposeTicket.id}!`);
      setTimeout(() => setActionNotice(""), 3500);
      setActivePurposeTicket(null);
      loadTickets();
    } catch {
      alert("Failed to assign resolution purpose.");
    }
  };

  const handleToggleCardStep = async (ticketId, stepIndex) => {
    try {
      await ticketService.toggleActionStep(ticketId, stepIndex);
      loadTickets();
    } catch {
      alert("Could not update step progress.");
    }
  };

  const toggleExpandChecklist = (ticketId) => {
    setExpandedChecklists((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "OPEN" && t.status !== "OPEN") return false;
    if (activeTab === "IN_PROGRESS" && t.status !== "IN_PROGRESS") return false;
    if (activeTab === "RESOLVED" && !(t.status === "RESOLVED" || t.status === "CLOSED")) return false;

    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
    if (purposeFilter !== "ALL" && (t.resolutionPurpose || "General Triage & Investigation") !== purposeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = String(t.id).toLowerCase().includes(q);
      const matchSub = t.subject.toLowerCase().includes(q);
      const matchCust = t.user?.name?.toLowerCase().includes(q);
      const matchPurp = (t.resolutionPurpose || "").toLowerCase().includes(q);
      if (!matchId && !matchSub && !matchCust && !matchPurp) return false;
    }

    return true;
  });

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <span className="hero-pill-badge">Staff Agent Workbench</span>
          <h1 style={{ fontSize: "32px", color: "var(--olive-950)", margin: "4px 0" }}>
            Customer Support Ticket Queue
          </h1>
          <p style={{ color: "var(--text-body)", fontSize: "14px" }}>
            Triage incoming issues, reassign specialists, apply canned templates, and reply with AI drafts.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/admin-dashboard" className="btn-secondary">
            ← View Analytics Dashboard
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div
          style={{
            backgroundColor: "var(--olive-100)",
            border: "1px solid var(--olive-400)",
            color: "var(--olive-950)",
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>✓</span> {actionNotice}
        </div>
      )}

      {/* Filter and Search Bar */}
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
              Pending ({tickets.filter((t) => t.status === "OPEN").length})
            </button>
            <button
              className={`filter-pill-btn ${activeTab === "IN_PROGRESS" ? "active" : ""}`}
              onClick={() => setActiveTab("IN_PROGRESS")}
            >
              In Progress ({tickets.filter((t) => t.status === "IN_PROGRESS").length})
            </button>
            <button
              className={`filter-pill-btn ${activeTab === "RESOLVED" ? "active" : ""}`}
              onClick={() => setActiveTab("RESOLVED")}
            >
              Resolved ({tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length})
            </button>
          </div>

          {/* Priority, Category and Search */}
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
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: "auto", padding: "8px 12px", marginBottom: 0, fontSize: "13px" }}
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority Only</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              style={{ width: "auto", padding: "8px 12px", marginBottom: 0, fontSize: "13px" }}
            >
              <option value="ALL">🎯 All Resolution Purposes</option>
              {RESOLUTION_PURPOSES.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>

            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search ticket #, customer, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px 14px", marginBottom: 0, fontSize: "13px" }}
              />
            </div>
          </div>
        </div>

        {/* Batch Operations Toolbar */}
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--beige-200)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="select-all-tickets"
              checked={filteredTickets.length > 0 && selectedIds.length === filteredTickets.length}
              onChange={toggleSelectAll}
              style={{ width: "auto", margin: 0 }}
            />
            <label htmlFor="select-all-tickets" style={{ margin: 0, fontSize: "13px", textTransform: "none", cursor: "pointer" }}>
              Select All Visible ({selectedIds.length} chosen)
            </label>
          </div>

          {selectedIds.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Bulk Actions:</span>
              <button
                className="btn-secondary btn-sm"
                onClick={() => handleBulkStatus("IN_PROGRESS")}
              >
                Mark In Progress
              </button>
              <button
                className="btn-primary btn-sm"
                onClick={() => handleBulkStatus("RESOLVED")}
              >
                Mark Resolved
              </button>
              <button
                className="btn-secondary btn-sm"
                onClick={() => setSelectedIds([])}
              >
                Deselect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Cards */}
      {loading ? (
        <div className="loading">Loading tickets in queue...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="empty-message">
          <h3 style={{ color: "var(--olive-950)" }}>No matching tickets in queue</h3>
          <p style={{ marginTop: "6px" }}>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredTickets.map((ticket) => {
            const hasDraft = replyDrafts[ticket.id] !== undefined;
            const isSelected = selectedIds.includes(ticket.id);

            return (
              <div
                key={ticket.id}
                className="card-surface"
                style={{
                  padding: "26px 30px",
                  marginBottom: 0,
                  borderColor: isSelected ? "var(--olive-600)" : "var(--border-color)",
                  boxShadow: isSelected ? "var(--shadow-md)" : "var(--shadow-sm)"
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectTicket(ticket.id)}
                      style={{ width: "auto", marginTop: "4px" }}
                    />

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
                          Category: {ticket.category}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--olive-900)", background: "var(--olive-100)", padding: "2px 8px", borderRadius: "10px" }}>
                          AI Sentiment: {ticket.sentiment || "Standard"}
                        </span>
                      </div>

                      <Link to={`/ticket/${ticket.id}`} style={{ textDecoration: "none" }}>
                        <h3 style={{ fontSize: "19px", color: "var(--olive-950)", margin: "8px 0 4px" }}>
                          {ticket.subject}
                        </h3>
                      </Link>

                      <div style={{ fontSize: "12.5px", color: "var(--text-muted)", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <span>Customer: <strong>{ticket.user?.name || "Customer"}</strong> ({ticket.user?.email || "N/A"})</span>
                        <span>•</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick status & Reassign controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {/* Reassign dropdown */}
                    <select
                      value={ticket.assignedTo || ""}
                      onChange={(e) => handleReassign(ticket.id, e.target.value)}
                      style={{ width: "auto", fontSize: "12px", padding: "6px 10px", marginBottom: 0 }}
                    >
                      <option disabled value="">Assign to Specialist...</option>
                      {staffMembers.map((staff) => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>

                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleUpdateStatus(ticket.id, "OPEN")}
                      disabled={ticket.status === "OPEN"}
                    >
                      Set Open
                    </button>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleUpdateStatus(ticket.id, "IN_PROGRESS")}
                      disabled={ticket.status === "IN_PROGRESS"}
                    >
                      In Progress
                    </button>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleUpdateStatus(ticket.id, "RESOLVED")}
                      disabled={ticket.status === "RESOLVED"}
                    >
                      Mark Resolved
                    </button>
                    <Link to={`/ticket/${ticket.id}`} className="btn-outline-olive btn-sm">
                      Full Thread →
                    </Link>
                  </div>
                </div>

                {/* Description snippet */}
                <div
                  style={{
                    backgroundColor: "var(--beige-50)",
                    padding: "14px 18px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13.5px",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    whiteSpace: "pre-line",
                    lineHeight: "1.5"
                  }}
                >
                  {ticket.description}
                </div>

                {/* Resolution Purpose & Goal-Driven Action Plan */}
                {(() => {
                  const purposeName = ticket.resolutionPurpose || "General Triage & Investigation";
                  const preset = RESOLUTION_PURPOSES.find((p) => p.name === purposeName);
                  const icon = preset ? preset.icon : "🎯";
                  const plan = ticket.resolutionPlan || [];
                  const completedSteps = plan.filter((s) => s.completed).length;
                  const totalSteps = plan.length;
                  const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                  const isExpanded = !!expandedChecklists[ticket.id];

                  return (
                    <div className="purpose-banner-box">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <span className="purpose-badge purpose-badge-lg">
                            <span className="purpose-badge-icon">{icon}</span>
                            <span>Target Purpose: <strong>{purposeName}</strong></span>
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--olive-800)", background: "rgba(86, 113, 66, 0.12)", padding: "3px 8px", borderRadius: "var(--radius-sm)", fontWeight: 600 }}>
                            ⏱️ Target: {ticket.targetResolutionDate || "Within 24 Hours"}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            style={{ fontSize: "12px", padding: "5px 12px" }}
                            onClick={() => handleOpenPurposeModal(ticket)}
                          >
                            🎯 Assign / Change Purpose
                          </button>
                          {totalSteps > 0 && (
                            <button
                              type="button"
                              className="btn-outline-olive btn-sm"
                              style={{ fontSize: "12px", padding: "5px 12px" }}
                              onClick={() => toggleExpandChecklist(ticket.id)}
                            >
                              {isExpanded ? "▲ Hide Action Plan" : `▼ Action Steps (${completedSteps}/${totalSteps})`}
                            </button>
                          )}
                        </div>
                      </div>

                      {ticket.resolutionNotes && (
                        <div style={{ fontSize: "12.5px", color: "var(--text-body)", marginTop: "8px", fontStyle: "italic" }}>
                          Objective: {ticket.resolutionNotes}
                        </div>
                      )}

                      {totalSteps > 0 && (
                        <div className="purpose-progress-wrap" style={{ marginTop: "10px" }}>
                          <div className="purpose-progress-track">
                            <div className="purpose-progress-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--olive-900)", minWidth: "95px" }}>
                            {completedSteps}/{totalSteps} Done ({pct}%)
                          </span>
                        </div>
                      )}

                      {/* Expandable Action Steps Checklist */}
                      {isExpanded && totalSteps > 0 && (
                        <div className="purpose-checklist-box">
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--olive-900)", marginBottom: "6px" }}>
                            Action Checklist for this Purpose (Click checkbox to update progress):
                          </div>
                          {plan.map((step, sIdx) => (
                            <div key={step.id || sIdx} className={`purpose-step-item ${step.completed ? "completed" : ""}`}>
                              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", margin: 0, textTransform: "none" }}>
                                <input
                                  type="checkbox"
                                  className="purpose-step-checkbox"
                                  checked={!!step.completed}
                                  onChange={() => handleToggleCardStep(ticket.id, sIdx)}
                                />
                                <span>{step.text}</span>
                              </label>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: step.completed ? "#16a34a" : "var(--olive-600)" }}>
                                {step.completed ? "✓ Completed" : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Canned Templates & AI Agent Reply Assistant */}
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--beige-200)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--olive-900)" }}>
                        Specialist Reply to Customer:
                      </div>
                      {/* Canned template selector */}
                      <select
                        onChange={(e) => {
                          const tpl = CANNED_TEMPLATES.find((t) => t.id === e.target.value);
                          if (tpl) handleApplyTemplate(ticket.id, tpl.text);
                        }}
                        defaultValue=""
                        style={{ width: "auto", fontSize: "11.5px", padding: "4px 8px", marginBottom: 0 }}
                      >
                        <option value="" disabled>📋 Select Canned Response...</option>
                        {CANNED_TEMPLATES.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      className="ai-enhance-button"
                      onClick={() => handleGenerateAIReply(ticket)}
                    >
                      <span>🤖</span> Generate AI Resolution Draft
                    </button>
                  </div>

                  {hasDraft ? (
                    <div style={{ marginTop: "10px" }}>
                      <textarea
                        value={replyDrafts[ticket.id]}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [ticket.id]: e.target.value
                          }))
                        }
                        style={{ minHeight: "140px", fontSize: "13px", marginBottom: "10px" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => {
                            setReplyDrafts((prev) => {
                              const copy = { ...prev };
                              delete copy[ticket.id];
                              return copy;
                            });
                          }}
                        >
                          Discard
                        </button>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => handleSendAgentReply(ticket.id)}
                        >
                          Send Official Reply to Customer →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Type a quick reply to customer or choose an AI / Canned response above..."
                        value={replyDrafts[ticket.id] || ""}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [ticket.id]: e.target.value
                          }))
                        }
                        style={{ fontSize: "13px", marginBottom: 0 }}
                      />
                      <button
                        className="btn-primary btn-sm"
                        style={{ flexShrink: 0 }}
                        onClick={() => handleSendAgentReply(ticket.id)}
                        disabled={!replyDrafts[ticket.id]?.trim()}
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purpose Assignment Modal Dialog */}
      {activePurposeTicket && (
        <div className="purpose-modal-backdrop" onClick={() => setActivePurposeTicket(null)}>
          <div className="purpose-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span className="hero-pill-badge" style={{ marginBottom: "6px" }}>🎯 Goal-Driven Resolution</span>
                <h2 style={{ fontSize: "22px", color: "var(--olive-950)", margin: "4px 0" }}>
                  Assign Resolution Purpose & Action Plan
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                  Ticket #{activePurposeTicket.id} • {activePurposeTicket.subject}
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setActivePurposeTicket(null)}
                style={{ padding: "6px 12px" }}
              >
                ✕ Close
              </button>
            </div>

            {/* Quick Presets Picker */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--olive-900)", marginBottom: "8px", display: "block" }}>
                Choose Pre-configured Resolution Purpose:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {RESOLUTION_PURPOSES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`ai-chip-button ${modalPurposeName === preset.name ? "active" : ""}`}
                    style={{
                      backgroundColor: modalPurposeName === preset.name ? "var(--olive-700)" : "var(--beige-100)",
                      color: modalPurposeName === preset.name ? "#ffffff" : "var(--olive-950)",
                      borderColor: modalPurposeName === preset.name ? "var(--olive-800)" : "var(--beige-400)"
                    }}
                    onClick={() => handleSelectPresetPurpose(preset.name)}
                  >
                    <span>{preset.icon}</span> {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Purpose Input */}
            <div className="form-group-item">
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px", display: "block" }}>
                Resolution Purpose Title:
              </label>
              <input
                type="text"
                value={modalPurposeName}
                onChange={(e) => setModalPurposeName(e.target.value)}
                placeholder="e.g. Refund & Financial Ledger Adjustment"
                style={{ fontSize: "13.5px" }}
              />
            </div>

            {/* Specialist & Target SLA Grid */}
            <div className="form-grid-2" style={{ marginBottom: "18px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px", display: "block" }}>
                  Assigned Specialist:
                </label>
                <select
                  value={modalAssignedTo}
                  onChange={(e) => setModalAssignedTo(e.target.value)}
                  style={{ fontSize: "13px" }}
                >
                  {staffMembers.map((staff) => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px", display: "block" }}>
                  Resolution Target SLA:
                </label>
                <select
                  value={modalTargetDate}
                  onChange={(e) => setModalTargetDate(e.target.value)}
                  style={{ fontSize: "13px" }}
                >
                  <option value="Within 4 Hours">Within 4 Hours (Critical / Security)</option>
                  <option value="Within 12 Hours">Within 12 Hours (High Priority)</option>
                  <option value="Within 24 Hours">Within 24 Hours (Standard Investigation)</option>
                  <option value="Within 48 Hours">Within 48 Hours (General Onboarding)</option>
                  <option value="Resolved">Already Resolved</option>
                </select>
              </div>
            </div>

            {/* Purpose Notes */}
            <div className="form-group-item">
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px", display: "block" }}>
                Resolution Objective / Context Notes:
              </label>
              <textarea
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Brief internal instructions or target goal for resolving this ticket..."
                style={{ minHeight: "75px", fontSize: "13px" }}
              />
            </div>

            {/* Action Steps Checklist Editor */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--olive-900)", marginBottom: "8px", display: "block" }}>
                Action Steps Checklist ({modalSteps.length} steps):
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                {modalSteps.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      background: "var(--beige-50)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      fontSize: "13px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--olive-700)", fontWeight: 700 }}>{idx + 1}.</span>
                      <span>{step.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveModalStep(idx)}
                      style={{ background: "transparent", color: "#dc2626", padding: "2px 6px", fontSize: "12px" }}
                      title="Remove step"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add custom step input */}
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Add custom action step to resolve this..."
                  value={newStepInput}
                  onChange={(e) => setNewStepInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddModalStep();
                    }
                  }}
                  style={{ fontSize: "13px", marginBottom: 0 }}
                />
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={handleAddModalStep}
                  style={{ flexShrink: 0 }}
                >
                  + Add Step
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "16px", borderTop: "1px solid var(--beige-200)" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActivePurposeTicket(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSavePurposeModal}
              >
                ✓ Save & Assign Purpose
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}