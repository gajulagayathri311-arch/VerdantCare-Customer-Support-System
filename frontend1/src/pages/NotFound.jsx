import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page-wrapper animate-fade-in" style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "72px", fontWeight: 800, color: "var(--olive-800)", lineHeight: 1 }}>
        404
      </div>
      <h2 style={{ fontSize: "28px", color: "var(--olive-950)", margin: "16px 0 8px" }}>
        Page Not Found
      </h2>
      <p style={{ color: "var(--text-body)", maxWidth: "460px", margin: "0 auto 24px" }}>
        The page you are looking for does not exist or has been moved. You can return to our homepage or seek assistance from our AI Copilot.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <Link to="/" className="btn-primary">
          Return to Home
        </Link>
        <Link to="/knowledge-base" className="btn-secondary">
          Browse Help Center
        </Link>
      </div>
    </div>
  );
}