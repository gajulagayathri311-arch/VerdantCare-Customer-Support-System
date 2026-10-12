
import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

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
    }
  }, [user]);

  // Save user and token after real backend login
  const login = (loginData) => {
    const loggedInUser = loginData.user || loginData;

    if (loginData.token) {
      localStorage.setItem("token", loginData.token);
    }

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
  };

  // Clear authentication details
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Demo mode does not create a real backend token
  const quickLoginAs = (role = "CUSTOMER") => {
    localStorage.removeItem("token");

    const demoUser =
      role === "ADMIN"
        ? ticketService.DEFAULT_USERS.admin
        : ticketService.DEFAULT_USERS.customer;

    localStorage.setItem("user", JSON.stringify(demoUser));
    setUser(demoUser);
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
