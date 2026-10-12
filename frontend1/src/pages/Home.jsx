import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate(`/create-ticket?initialDescription=${encodeURIComponent(quickQuery)}`);
  };

  const handleCategorySelect = (category, defaultSubject) => {
    navigate(`/create-ticket?initialDescription=${encodeURIComponent(defaultSubject)}&category=${encodeURIComponent(category)}`);
  };

  const faqs = [
    {
      q: "How fast will an agent respond to my ticket?",
      a: "Our Tier-1 emergency SLA guarantees assignment within 15 minutes. Standard technical and billing tickets receive specialist responses in under 1 hour. You can also get instant answers 24/7 via our integrated OliveAI Assistant."
    },
    {
      q: "Can I track my ticket status without logging in every time?",
      a: "Yes! Every ticket generates a unique reference code (e.g. #TCK-8421). You can view the live visual progression timeline and complete conversation thread right from your Customer Dashboard."
    },
    {
      q: "What if I was charged twice for a subscription?",
      a: "Duplicate transaction refunds are expedited. Submit a Billing ticket with your transaction ID, and our billing lead will verify merchant gateway logs and authorize an immediate refund within 2-4 business days."
    },
    {
      q: "How does the OliveAI Copilot assist with my problem?",
      a: "OliveAI analyzes your issue using natural language triage. It provides step-by-step diagnostic instructions and can automatically draft an official support ticket with all relevant details in just one click."
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Live Operational Status Banner */}
      <div
        style={{
          backgroundColor: "var(--olive-950)",
          color: "var(--beige-200)",
          padding: "10px 24px",
          borderBottom: "1px solid var(--olive-800)",
          fontSize: "12.5px"
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
            <span style={{ fontWeight: 700, color: "#ffffff" }}>Live Support Operations Active</span>
            <span style={{ color: "var(--olive-300)" }}>• 18 Specialists On Duty</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", color: "var(--olive-200)" }}>
            <span>⏱️ Avg Assignment: <strong>&lt; 14 mins</strong></span>
            <span>🌿 CSAT Satisfaction: <strong>98.6%</strong></span>
            <span>🤖 AI Instant Triage: <strong>24/7 Online</strong></span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-olive-beige">
        <div className="hero-content-box">
          <div className="hero-pill-badge">
            <span>🌿</span>
            <span>Next-Gen Customer Support & AI Diagnostics</span>
          </div>

          <h1 className="hero-title">
            Exceptional Customer Support, <br />
            Resolved Faster Than Ever.
          </h1>

          <p className="hero-subtitle">
            Experience support crafted for clarity and comfort. Share your problem with ease, get instant AI-guided troubleshooting, and track complete resolution with our specialized care team.
          </p>

          {/* Quick Problem Share Input */}
          <form
            onSubmit={handleQuickSubmit}
            style={{
              maxWidth: "680px",
              margin: "0 auto 32px",
              display: "flex",
              gap: "10px",
              background: "var(--surface-white)",
              padding: "8px",
              borderRadius: "var(--radius-full)",
              boxShadow: "var(--shadow-md)",
              border: "2px solid var(--border-color)"
            }}
          >
            <input
              type="text"
              placeholder="What issue can we resolve for you today? (e.g. duplicate charge, 2FA code delayed...)"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              style={{
                border: "none",
                boxShadow: "none",
                padding: "10px 18px",
                fontSize: "14px",
                marginBottom: 0
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                borderRadius: "var(--radius-full)",
                padding: "10px 24px",
                flexShrink: 0
              }}
            >
              Start Ticket →
            </button>
          </form>

          {/* Action Buttons */}
          <div className="hero-actions-row">
            {user?.role === "ADMIN" ? (
              <Link to="/manage-tickets" className="btn-primary btn-lg">
                Manage Ticket Queue ({">"}3 Open) →
              </Link>
            ) : (
              <Link to="/create-ticket" className="btn-primary btn-lg">
                Submit Support Ticket →
              </Link>
            )}

            <Link to="/knowledge-base" className="btn-secondary btn-lg">
              Browse Help Center
            </Link>

            <button
              type="button"
              className="btn-outline-olive btn-lg"
              onClick={() => {
                const btn = document.querySelector(".ai-floating-trigger");
                if (btn) btn.click();
              }}
            >
              🤖 Ask OliveAI Copilot
            </button>
          </div>
        </div>
      </section>

      {/* Express Problem Finder by Category */}
      <section className="page-wrapper" style={{ padding: "48px 24px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="hero-pill-badge">Express Problem Navigator</span>
          <h2 style={{ fontSize: "28px", color: "var(--olive-950)", margin: "6px 0" }}>
            Select Your Problem Category For Instant Routing
          </h2>
          <p style={{ color: "var(--text-body)", fontSize: "14px" }}>
            Click any tile below to launch a targeted support request with pre-calibrated diagnostic fields.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          <div
            className="card-surface"
            style={{ cursor: "pointer", transition: "all 0.2s", padding: "24px" }}
            onClick={() => handleCategorySelect("Billing", "Inquiry regarding invoice renewal or payment charge")}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>💳</div>
            <h3 style={{ fontSize: "17px", color: "var(--olive-950)", marginBottom: "6px" }}>
              Billing & Refunds
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-body)", marginBottom: "14px" }}>
              Duplicate debits, invoices, subscription changes, and payment disputes.
            </p>
            <span style={{ fontSize: "12px", color: "var(--olive-700)", fontWeight: 700 }}>
              Launch Billing Ticket →
            </span>
          </div>

          <div
            className="card-surface"
            style={{ cursor: "pointer", transition: "all 0.2s", padding: "24px" }}
            onClick={() => handleCategorySelect("Account", "Unable to log in or delayed two-factor authentication code")}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔑</div>
            <h3 style={{ fontSize: "17px", color: "var(--olive-950)", marginBottom: "6px" }}>
              Account & Security
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-body)", marginBottom: "14px" }}>
              Locked account, 2FA SMS failures, password recovery, or profile settings.
            </p>
            <span style={{ fontSize: "12px", color: "var(--olive-700)", fontWeight: 700 }}>
              Launch Security Ticket →
            </span>
          </div>

          <div
            className="card-surface"
            style={{ cursor: "pointer", transition: "all 0.2s", padding: "24px" }}
            onClick={() => handleCategorySelect("Technical", "Application glitch, 500 error code, or browser crash")}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚙️</div>
            <h3 style={{ fontSize: "17px", color: "var(--olive-950)", marginBottom: "6px" }}>
              Technical Glitches
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-body)", marginBottom: "14px" }}>
              Page freezes, slow response, report export bugs, and system error screens.
            </p>
            <span style={{ fontSize: "12px", color: "var(--olive-700)", fontWeight: 700 }}>
              Launch Bug Report →
            </span>
          </div>

          <div
            className="card-surface"
            style={{ cursor: "pointer", transition: "all 0.2s", padding: "24px" }}
            onClick={() => handleCategorySelect("Service", "Order delivery status and shipment tracking inquiry")}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📦</div>
            <h3 style={{ fontSize: "17px", color: "var(--olive-950)", marginBottom: "6px" }}>
              Service & Logistics
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-body)", marginBottom: "14px" }}>
              Shipment dispatch tracking, delayed delivery, and fulfillment inquiries.
            </p>
            <span style={{ fontSize: "12px", color: "var(--olive-700)", fontWeight: 700 }}>
              Track Fulfillment →
            </span>
          </div>
        </div>
      </section>

      {/* 3 Steps To Resolution */}
      <section className="page-wrapper" style={{ padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="hero-pill-badge">Transparent Workflow</span>
          <h2 style={{ fontSize: "28px", color: "var(--olive-950)" }}>
            How Every Customer Problem Gets Resolved
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div className="card-surface" style={{ textAlign: "center" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "var(--olive-100)",
                color: "var(--olive-800)",
                fontSize: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontWeight: "bold"
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "var(--olive-950)" }}>
              Share Your Issue
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-body)" }}>
              Describe what happened. Use our <strong>AI Problem Enhancer</strong> to auto-structure reproduction steps and attach error logs.
            </p>
          </div>

          <div className="card-surface" style={{ textAlign: "center" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "var(--olive-100)",
                color: "var(--olive-800)",
                fontSize: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontWeight: "bold"
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "var(--olive-950)" }}>
              Triage & Active Review
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-body)" }}>
              Your ticket is assigned to a specialist engineer. Communicate directly in a live message thread as we verify system logs.
            </p>
          </div>

          <div className="card-surface" style={{ textAlign: "center" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "var(--olive-100)",
                color: "var(--olive-800)",
                fontSize: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontWeight: "bold"
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "var(--olive-950)" }}>
              Verified Fix & Feedback
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-body)" }}>
              Confirm your fix, view the resolution timeline, and submit a 5-star rating to ensure continuous excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="page-wrapper" style={{ padding: "12px 24px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="hero-pill-badge">Common Questions</span>
          <h2 style={{ fontSize: "28px", color: "var(--olive-950)" }}>
            Quick Answers to Common Concerns
          </h2>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="card-surface"
                style={{ padding: "18px 24px", marginBottom: 0, cursor: "pointer" }}
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <h4 style={{ fontSize: "16px", color: "var(--olive-950)", margin: 0 }}>
                    {faq.q}
                  </h4>
                  <span style={{ fontSize: "18px", color: "var(--olive-700)", fontWeight: "bold" }}>
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
                {isOpen && (
                  <p style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--beige-200)", fontSize: "13.5px", color: "var(--text-body)", lineHeight: "1.6" }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}