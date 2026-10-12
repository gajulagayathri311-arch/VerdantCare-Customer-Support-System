import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner-grid">
        {/* Brand Summary */}
        <div className="footer-col">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "24px" }}>🌿</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--beige-100)" }}>
              VerdantCare
            </span>
          </div>
          <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--beige-400)", maxWidth: "340px" }}>
            Next-generation customer support management and AI triage platform. Built to empower customers to share their issues effortlessly and get rapid resolutions.
          </p>
          <div style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", padding: "6px 12px", borderRadius: "20px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
            <span style={{ fontSize: "12px", color: "var(--beige-200)", fontWeight: 600 }}>All Support Systems Operational</span>
          </div>
        </div>

        {/* Customer Self-Serve */}
        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/customer-dashboard">Customer Dashboard</Link></li>
            <li><Link to="/create-ticket">Submit New Ticket</Link></li>
            <li><Link to="/my-tickets">Track Active Tickets</Link></li>
            <li><Link to="/knowledge-base">Knowledge Base & Guides</Link></li>
          </ul>
        </div>

        {/* Support Channels */}
        <div className="footer-col">
          <h4>Support Channels</h4>
          <ul>
            <li><span style={{ color: "var(--beige-400)", fontSize: "13px" }}>Email: care@verdantcare.com</span></li>
            <li><span style={{ color: "var(--beige-400)", fontSize: "13px" }}>Hotline: 1-800-VERDANT</span></li>
            <li><span style={{ color: "var(--beige-400)", fontSize: "13px" }}>Hours: Mon - Fri (8AM - 8PM EST)</span></li>
            <li><span style={{ color: "var(--beige-400)", fontSize: "13px" }}>AI Assistant: 24/7 Live Triage</span></li>
          </ul>
        </div>

        {/* Security & Compliance */}
        <div className="footer-col">
          <h4>Security & SLA</h4>
          <ul>
            <li><span style={{ color: "var(--beige-400)", fontSize: "13px" }}>Tier-1 SLA: &lt; 15 min response</span></li>
            <li><span style={{ color: "var(--beige-400)", fontSize: "13px" }}>End-to-End Encryption</span></li>
            <li><span style={{ color: "var(--beige-400)", fontSize: "13px" }}>SOC-2 Type II Certified</span></li>
            <li><span style={{ color: "var(--beige-400)", fontSize: "13px" }}>GDPR & CCPA Compliant</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div>
          © {new Date().getFullYear()} VerdantCare Customer Support Management System. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <span>Theme: Beige & Olive Green</span>
          <span>•</span>
          <span>Integrated AI Assistant</span>
        </div>
      </div>
    </footer>
  );
}