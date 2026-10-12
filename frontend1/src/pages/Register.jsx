import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "../styles/Login.css";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const newUser = {
      id: Math.floor(100 + Math.random() * 900),
      name: name.trim(),
      email: email.trim(),
      password,
      role
    };

    try {
      await API.post("/auth/register", newUser);
    } catch {
      // Fallback: proceed locally
    }

    login(newUser);

    if (role === "ADMIN") {
      navigate("/admin-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-form">
        {/* Centered Brand Icon & Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginBottom: "22px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "var(--olive-100)",
              border: "1.5px solid var(--olive-300)",
              color: "var(--olive-800)",
              fontSize: "26px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 2px 8px rgba(53, 71, 40, 0.1)"
            }}
          >
            🌿
          </div>
          <h2>Join VerdantCare</h2>
          <div className="auth-subtext">
            Create an account to submit tickets and track resolutions.
          </div>
        </div>

        {errorMsg && (
          <div className="auth-alert-error">
            {errorMsg}
          </div>
        )}

        {/* Form with all fields centered */}
        <form onSubmit={handleRegister}>
          <div className="auth-form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="e.g. sarah.jenkins@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="reg-role">Account Type</label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="CUSTOMER">Customer (Submit & Track Inquiries)</option>
              <option value="ADMIN">Support Specialist / Admin</option>
            </select>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Complete Registration →"}
          </button>
        </form>

        <div className="auth-bottom-footer-link">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--olive-700)", fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}