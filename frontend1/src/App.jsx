import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIAssistantWidget from "./components/AIAssistantWidget";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";
import AdminDashboard from "./pages/AdminDashboard";
import ManageTickets from "./pages/ManageTickets";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotFound from "./pages/NotFound";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar />

        {/* Core Application Views */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/ticket/:id" element={<TicketDetails />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/manage-tickets" element={<ManageTickets />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Global 24/7 AI Customer Support Copilot Widget */}
        <AIAssistantWidget />

        {/* Footer */}
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;