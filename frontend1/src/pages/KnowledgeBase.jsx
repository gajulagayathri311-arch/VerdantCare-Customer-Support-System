import { useState } from "react";
import { Link } from "react-router-dom";
import { ticketService } from "../services/ticketService";

export default function KnowledgeBase() {
  const [articles, setArticles] = useState(() => ticketService.getKnowledgeBase());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [expandedId, setExpandedId] = useState("kb-1");

  const categories = ["ALL", "Billing", "Account", "Technical", "Service"];

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === "ALL" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleVote = (id, isHelpful) => {
    const updated = ticketService.voteArticle(id, isHelpful);
    setArticles(updated);
  };

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Knowledge Base Header */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <span className="hero-pill-badge">Self-Service Knowledge Base</span>
        <h1 style={{ fontSize: "36px", color: "var(--olive-950)", marginBottom: "12px" }}>
          How Can We Help You Today?
        </h1>
        <p style={{ color: "var(--text-body)", maxWidth: "600px", margin: "0 auto 24px" }}>
          Browse our verified troubleshooting guides, policy documentation, or use our instant AI Assistant to resolve problems right now.
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: "560px", margin: "0 auto", position: "relative" }}>
          <input
            type="text"
            placeholder="Search keywords (e.g. refund, password reset, 500 error, delivery)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "14px 20px",
              fontSize: "15px",
              borderRadius: "var(--radius-full)",
              border: "2px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)"
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-pill-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ padding: "8px 18px", fontSize: "14px" }}
          >
            {cat === "ALL" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {/* Article Grid / Accordions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px", margin: "0 auto" }}>
        {filteredArticles.length === 0 ? (
          <div className="empty-message">
            <h3>No articles match your search query</h3>
            <p style={{ marginTop: "8px" }}>
              Can't find what you need? Our AI Assistant or Support Team can resolve your issue directly.
            </p>
            <div style={{ marginTop: "16px" }}>
              <Link to="/create-ticket" className="btn-primary">
                Open Support Ticket
              </Link>
            </div>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const isExpanded = expandedId === art.id;
            return (
              <div
                key={art.id}
                className="card-surface"
                style={{ padding: "20px 24px", marginBottom: 0, cursor: "pointer" }}
                onClick={() => setExpandedId(isExpanded ? null : art.id)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <span className="kb-category-tag">{art.category}</span>
                    <h3 style={{ fontSize: "18px", color: "var(--olive-950)", margin: "4px 0" }}>
                      {art.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--text-body)" }}>
                      {art.summary}
                    </p>
                  </div>
                  <div style={{ fontSize: "20px", color: "var(--olive-700)", fontWeight: "bold" }}>
                    {isExpanded ? "−" : "+"}
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid var(--beige-200)",
                      cursor: "default"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--text-main)", whiteSpace: "pre-line" }}>
                      {art.content}
                    </div>

                    <div
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                        backgroundColor: "var(--beige-50)",
                        padding: "12px 16px",
                        borderRadius: "var(--radius-md)"
                      }}
                    >
                      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        Was this article helpful? ({art.helpfulCount} found this useful)
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => handleVote(art.id, true)}
                        >
                          👍 Yes
                        </button>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => handleVote(art.id, false)}
                        >
                          👎 No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help callout banner */}
      <div
        className="card-surface"
        style={{
          maxWidth: "900px",
          margin: "40px auto 0",
          backgroundColor: "var(--olive-50)",
          borderColor: "var(--olive-300)",
          textAlign: "center"
        }}
      >
        <h3 style={{ color: "var(--olive-950)", marginBottom: "8px" }}>
          Didn't find an answer to your problem?
        </h3>
        <p style={{ color: "var(--text-body)", maxWidth: "600px", margin: "0 auto 20px" }}>
          Don't worry! Our support team and AI copilot are ready to assist you. Share your specific problem with us and we'll take care of it immediately.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <Link to="/create-ticket" className="btn-primary">
            Submit a Support Ticket
          </Link>
          <Link to="/my-tickets" className="btn-outline-olive">
            View My Existing Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
