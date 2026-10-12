import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, quickLoginAs } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="site-navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-badge">
          <div className="brand-icon-leaf">🌿</div>
          <div>
            <div className="brand-name">VerdantCare</div>
            <div className="brand-sub">Support Intelligence</div>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="navbar-menu">
          <Link
            to="/"
            className={`nav-link-item ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>

          <Link
            to="/knowledge-base"
            className={`nav-link-item ${isActive("/knowledge-base") ? "active" : ""}`}
          >
            Help Center
          </Link>

          {/* Customer Specific Links */}
          {user && user.role === "CUSTOMER" && (
            <>
              <Link
                to="/customer-dashboard"
                className={`nav-link-item ${isActive("/customer-dashboard") ? "active" : ""}`}
              >
                Dashboard
              </Link>
              <Link
                to="/create-ticket"
                className={`nav-link-item ${isActive("/create-ticket") ? "active" : ""}`}
              >
                Submit Ticket
              </Link>
              <Link
                to="/my-tickets"
                className={`nav-link-item ${isActive("/my-tickets") ? "active" : ""}`}
              >
                My Tickets
              </Link>
            </>
          )}

          {/* Admin / Agent Specific Links */}
          {user && user.role === "ADMIN" && (
            <>
              <Link
                to="/admin-dashboard"
                className={`nav-link-item ${isActive("/admin-dashboard") ? "active" : ""}`}
              >
                Analytics
              </Link>
              <Link
                to="/manage-tickets"
                className={`nav-link-item ${isActive("/manage-tickets") ? "active" : ""}`}
              >
                Ticket Queue
              </Link>
            </>
          )}

          {/* Quick Demo Role Switcher for instant testing */}
          <div className="demo-role-switcher" title="Quick switch between Customer and Agent view">
            <button
              className={`demo-role-btn ${user?.role === "CUSTOMER" ? "active" : ""}`}
              onClick={() => {
                quickLoginAs("CUSTOMER");
                navigate("/customer-dashboard");
              }}
            >
              Customer
            </button>
            <button
              className={`demo-role-btn ${user?.role === "ADMIN" ? "active" : ""}`}
              onClick={() => {
                quickLoginAs("ADMIN");
                navigate("/admin-dashboard");
              }}
            >
              Agent / Admin
            </button>
          </div>

          {/* Profile / Auth State */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="user-profile-pill">
                <div className="user-avatar-circle">
                  {user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : "U")}
                </div>
                <div className="user-info-text">
                  <div className="user-name-label">{user.name || "Sarah Jenkins"}</div>
                  <div className="user-role-label">{user.role}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-logout-nav">
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link to="/login" className="nav-link-item">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}