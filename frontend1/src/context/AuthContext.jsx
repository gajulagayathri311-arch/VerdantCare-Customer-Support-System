import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import API from "../services/api";
import { ticketService } from "../services/ticketService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Unable to read saved user:", error);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user]);

  // Listen for 401 Unauthorized events from api.js
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("Session expired or token invalid. Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // Save user and token after login or registration
  const login = (loginData) => {
    const loggedInUser = loginData.user || loginData;

    if (loginData.token) {
      localStorage.setItem("token", loginData.token);
    }

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  // Clear authentication details
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Quick Demo Login: Authenticates with backend to acquire a valid token
  const quickLoginAs = async (role = "CUSTOMER") => {
    const isAgent = role === "ADMIN";
    const credentials = isAgent
      ? { email: "alex.mercer@verdantcare.com", password: "admin123" }
      : { email: "sarah.jenkins@example.com", password: "password123" };

    const fallbackUser = isAgent
      ? ticketService.DEFAULT_USERS.admin
      : ticketService.DEFAULT_USERS.customer;

    try {
      const response = await API.post("/auth/login", credentials);
      if (response.data?.token && response.data?.user) {
        login(response.data);
        return response.data.user;
      }
    } catch (error) {
      console.warn("Quick demo backend auth fallback:", error.message);
    }

    // Set demo token fallback supported by backend authMiddleware
    const demoToken = isAgent ? "demo_admin_token" : "demo_customer_token";
    localStorage.setItem("token", demoToken);
    localStorage.setItem("user", JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    return fallbackUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        quickLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
