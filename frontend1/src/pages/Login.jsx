import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, quickLoginAs } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isSessionExpired = searchParams.get("session") === "expired";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await API.post("/auth/login", {
        email: email.trim(),
        password
      });

      const data = response.data;

      if (!data.token || !data.user) {
        throw new Error("Server did not return a valid session token.");
      }

      // Update React authentication state and localStorage
      login(data);

      // Navigate according to user role
      if (data.user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setErrorMsg(
        error.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const user = await quickLoginAs(role);
      if (user?.role === "ADMIN" || role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    } catch (err) {
      console.error("Demo login error:", err);
      setErrorMsg("Unable to complete demo sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-form">
        {/* Brand Icon & Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            marginBottom: "22px"
          }}
        >
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

          <h2>VerdantCare Portal</h2>

          <div className="auth-subtext">
            Sign in to access your customer tickets and AI support.
          </div>
        </div>

        {isSessionExpired && !errorMsg && (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              backgroundColor: "var(--status-open-bg)",
              color: "var(--status-open-text)",
              border: "1px solid var(--status-open-border)",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              marginBottom: "18px",
              fontSize: "13px"
            }}
          >
            ⏱️ Your session expired. Please sign in to continue.
          </div>
        )}

        {errorMsg && (
          <div className="auth-alert-error">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="auth-form-group">
            <label htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. sarah.jenkins@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Portal →"}
          </button>
        </form>

        <div className="demo-account-box">
          <div className="demo-account-title">
            ⚡ Quick Demo Sign In
          </div>

          <div className="demo-btn-group">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("CUSTOMER")}
            >
              👤 Sarah (Customer)
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo("ADMIN")}
            >
              🛡️ Alex (Agent / Admin)
            </button>
          </div>
        </div>

        <div className="auth-bottom-footer-link">
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--olive-700)",
              fontWeight: 700
            }}
          >
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}
