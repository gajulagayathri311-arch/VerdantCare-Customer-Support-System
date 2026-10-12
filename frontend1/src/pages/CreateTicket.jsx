import { useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketService } from "../services/ticketService";
import { enhanceProblemDescription } from "../services/aiService";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialDesc = searchParams.get("initialDescription") || "";
  const initialCat = searchParams.get("category") || "Technical";

  const [subject, setSubject] = useState(
    initialDesc ? `Support Request: ${initialDesc.slice(0, 40)}...` : ""
  );
  const [description, setDescription] = useState(initialDesc);
  const [category, setCategory] = useState(initialCat);
  const [priority, setPriority] = useState("Medium");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [contactPreference, setContactPreference] = useState("In-App Discussion");
  const [attachments, setAttachments] = useState([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Live matching articles based on subject input
  const matchingArticles = useMemo(() => {
    return ticketService.searchKnowledge(subject || description);
  }, [subject, description]);

  // AI Problem Enhancer
  const handleAIEnhance = () => {
    if (!description.trim()) {
      alert("Please type a brief description first before enhancing with AI.");
      return;
    }
    setIsEnhancing(true);
    setTimeout(() => {
      const enhanced = enhanceProblemDescription(description, category);
      setDescription(enhanced);
      setIsEnhancing(false);
    }, 400);
  };

  const handleSimulatedFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = files.map((f) => ({
        id: `att-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (fileId) => {
    setAttachments((prev) => prev.filter((a) => a.id !== fileId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert("Please provide both subject and description.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalDescription = description;
      if (includeDiagnostics) {
        finalDescription += `\n\n[DIAGNOSTIC TELEMETRY]\n- Preferred Contact: ${contactPreference}\n- User Agent: ${navigator.userAgent}\n- Resolution: ${window.screen.width}x${window.screen.height}\n- Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
      }

      const created = await ticketService.createTicket({
        subject: subject.trim(),
        description: finalDescription,
        category,
        priority,
        userId: user?.id || 101,
        userName: user?.name || "Sarah Jenkins",
        userEmail: user?.email || "sarah.jenkins@example.com",
        attachments: attachments.map((a) => a.name)
      });

      setSuccessMsg(`Ticket #${created.id} submitted! Assigning specialist...`);

      setTimeout(() => {
        navigate(`/ticket/${created.id}`);
      }, 1200);
    } catch {
      alert("Unable to create ticket at this time. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Breadcrumb Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "8px", fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
            <Link to="/customer-dashboard">Dashboard</Link>
            <span>/</span>
            <span>Submit Ticket</span>
          </div>
          <span className="hero-pill-badge">Problem Intake & AI Diagnostic</span>
          <h1 style={{ fontSize: "32px", color: "var(--olive-950)", margin: "4px 0" }}>
            Submit a Support Request
          </h1>
          <p style={{ color: "var(--text-body)", fontSize: "14px" }}>
            Provide details of your issue. Our AI assistant and assigned specialists ensure rapid, transparent resolution.
          </p>
        </div>

        {successMsg && (
          <div
            style={{
              backgroundColor: "var(--olive-100)",
              border: "1px solid var(--olive-400)",
              color: "var(--olive-900)",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              marginBottom: "24px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <span>✓</span> {successMsg}
          </div>
        )}

        {/* Live Knowledge Base Match Banner */}
        {matchingArticles.length > 0 && (
          <div
            style={{
              backgroundColor: "var(--olive-50)",
              border: "1px dashed var(--olive-400)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              marginBottom: "24px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "18px" }}>💡</span>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--olive-900)" }}>
                Instant Self-Help Suggestion: We found a matching guide!
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-body)", margin: "0 0 10px" }}>
              You may be able to resolve this immediately without waiting for a specialist:
            </p>
            {matchingArticles.map((art) => (
              <div
                key={art.id}
                style={{
                  background: "var(--surface-white)",
                  border: "1px solid var(--border-color)",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginBottom: "6px"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--olive-950)" }}>
                    {art.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {art.summary}
                  </div>
                </div>
                <Link to="/knowledge-base" className="btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                  Read Guide →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Main Ticket Form Card */}
        <div className="ticket-form-card">
          <form onSubmit={handleSubmit}>
            {/* Subject */}
            <div className="form-group-item">
              <label htmlFor="ticket-subject">Ticket Subject / Summary *</label>
              <input
                id="ticket-subject"
                type="text"
                placeholder="Brief summary of the issue (e.g. Duplicate charge on annual renewal invoice)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Category & Priority Grid */}
            <div className="form-grid-2 form-group-item">
              <div>
                <label htmlFor="ticket-category">Category *</label>
                <select
                  id="ticket-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Technical">Technical / Bug Glitch</option>
                  <option value="Billing">Billing & Subscription</option>
                  <option value="Account">Account Access & Security</option>
                  <option value="Service">Service & Shipment Logistics</option>
                  <option value="Feature Request">Feature Request / Feedback</option>
                  
                  <option value="Order Cancellation">
  Order Cancellation
                  </option>
                  <option value="Refund and Return">
                    Refund and Return
                  </option>
                  <option value="Product Replacement">
                    Product Replacement
                  </option>
                  <option value="Delivery Delay">
                    Delivery Delay
                  </option>
                  <option value="Product Quality Issue">
                    Product Quality Issue
                  </option>
                  <option value="Warranty and Repair">
                    Warranty and Repair
                  </option>

                </select>
              </div>

              <div>
                <label htmlFor="ticket-priority">Priority & Response SLA *</label>
                <select
                  id="ticket-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low (General Inquiry — &lt; 24h SLA)</option>
                  <option value="Medium">Medium (Workflow Impeded — &lt; 4h SLA)</option>
                  <option value="High">High (Urgent Impact — &lt; 1h SLA)</option>
                </select>
              </div>
            </div>

            {/* Contact Preference */}
            <div className="form-group-item">
              <label>Preferred Communication Method</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                {["In-App Discussion Thread", "Email Notifications", "Urgent SMS Alert"].map((pref) => (
                  <button
                    type="button"
                    key={pref}
                    className={`btn-sm ${contactPreference === pref ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setContactPreference(pref)}
                  >
                    {contactPreference === pref ? "✓ " : ""}{pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="form-group-item">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="ticket-desc" style={{ marginBottom: 0 }}>
                  Detailed Problem Description *
                </label>
                <button
                  type="button"
                  className="ai-enhance-button"
                  onClick={handleAIEnhance}
                  disabled={isEnhancing}
                >
                  <span>✨</span>
                  {isEnhancing ? "Structuring with AI..." : "Enhance with AI Assistant"}
                </button>
              </div>
              <textarea
                id="ticket-desc"
                placeholder="Explain what happened, steps to reproduce, or any error messages you received..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ marginTop: "8px", minHeight: "160px" }}
                required
              />
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                💡 Tip: Click <strong>Enhance with AI Assistant</strong> to automatically structure your issue with reproduction steps and environment impact tags.
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div className="form-group-item">
              <label>Attachments & Screenshots (Optional)</label>
              <div className="file-upload-dropzone">
                <input
                  type="file"
                  id="file-input-field"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleSimulatedFileUpload}
                />
                <label
                  htmlFor="file-input-field"
                  style={{ cursor: "pointer", textTransform: "none", margin: 0 }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📎</div>
                  <div style={{ fontWeight: 600, color: "var(--olive-900)", fontSize: "14px" }}>
                    Click or drop screenshots, bank invoices, or log files
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Supports PNG, JPG, PDF, TXT (up to 10MB each)
                  </div>
                </label>
              </div>

              {attachments.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "var(--beige-200)",
                        padding: "5px 12px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "12.5px"
                      }}
                    >
                      <span>📄 {file.name}</span>
                      <span style={{ color: "var(--text-muted)" }}>({file.size})</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontWeight: "bold",
                          padding: 0,
                          fontSize: "14px"
                        }}
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diagnostics checkbox */}
            <div className="form-group-item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="diag-check"
                checked={includeDiagnostics}
                onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                style={{ width: "auto", margin: 0 }}
              />
              <label htmlFor="diag-check" style={{ margin: 0, textTransform: "none", fontWeight: "normal", fontSize: "13px" }}>
                Include browser and device environment telemetry to expedite engineering diagnosis
              </label>
            </div>

            {/* Live Preview Toggle */}
            <div style={{ marginBottom: "20px" }}>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Hide Preview" : "👁️ Preview Ticket Before Submitting"}
              </button>

              {showPreview && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "18px",
                    backgroundColor: "var(--beige-50)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)"
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--olive-800)", marginBottom: "6px" }}>
                    Ticket Preview (As seen by Support Specialists)
                  </div>
                  <h4 style={{ color: "var(--olive-950)", margin: "4px 0" }}>
                    {subject || "(Subject will appear here)"}
                  </h4>
                  <div style={{ display: "flex", gap: "8px", margin: "6px 0 10px", fontSize: "11px" }}>
                    <span className="badge-priority priority-medium">{category}</span>
                    <span className="badge-priority priority-high">{priority} Priority</span>
                    <span style={{ color: "var(--text-muted)" }}>Contact: {contactPreference}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-main)", whiteSpace: "pre-wrap" }}>
                    {description || "(Description will appear here)"}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "14px", marginTop: "28px" }}>
              <Link to="/customer-dashboard" className="btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-primary btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Ticket..." : "Submit Support Ticket →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}