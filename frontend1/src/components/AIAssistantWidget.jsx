import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateAIResponse, AI_QUICK_PROMPTS } from "../services/aiService";
import { ticketService } from "../services/ticketService";
import { useAuth } from "../context/AuthContext";

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "ai-init",
      sender: "AI Assistant",
      isAi: true,
      timestamp: "Just now",
      text: "Hello! I am **OliveAI**, your 24/7 intelligent customer support partner.\n\nI can diagnose issues, troubleshoot problems step-by-step, or convert our conversation into a high-priority ticket for human specialists.\n\nHow can I help you today?",
      ticketDraft: null
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: user?.name || "Customer",
      isAi: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI thinking and processing
    setTimeout(() => {
      const response = generateAIResponse(query, messages);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "OliveAI",
        isAi: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: response.text,
        category: response.category,
        priority: response.priority,
        ticketDraft: response.ticketDraft
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleConvertToTicket = async (draft) => {
    if (!draft) return;
    try {
      const created = await ticketService.createTicket({
        subject: draft.subject,
        description: draft.description,
        category: draft.category,
        priority: draft.priority,
        userId: user?.id || 101,
        userName: user?.name || "Sarah Jenkins",
        userEmail: user?.email || "sarah.jenkins@example.com"
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-sys-${Date.now()}`,
          sender: "OliveAI",
          isAi: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: `🎉 **Support Ticket Created Successfully!**\n\nTicket Reference: **#${created.id}**\nCategory: **${created.category}** | Priority: **${created.priority}**\n\nOur team has received this and will follow up shortly. You can monitor progress in My Tickets.`
        }
      ]);

      setTimeout(() => {
        setIsOpen(false);
        navigate(`/ticket/${created.id}`);
      }, 1400);
    } catch {
      alert("Unable to auto-create ticket. Please try via the Create Ticket form.");
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "ai-init-fresh",
        sender: "AI Assistant",
        isAi: true,
        timestamp: "Just now",
        text: "Conversation refreshed. How may I assist you with your account, billing, or technical concerns?"
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className="ai-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Support Assistant"
      >
        <span className="ai-pulse-dot"></span>
        <span style={{ fontSize: "16px" }}>🌿</span>
        <span style={{ fontWeight: 700, fontSize: "14px" }}>
          {isOpen ? "Close Assistant" : "Ask AI Assistant"}
        </span>
      </button>

      {/* Floating Modal Window */}
      {isOpen && (
        <div className="ai-chat-window-modal">
          {/* Header */}
          <div className="ai-modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--olive-600)",
                  border: "1.5px solid var(--olive-300)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px"
                }}
              >
                🤖
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "15px", color: "#ffffff", fontWeight: 700 }}>
                  OliveAI Copilot
                </h4>
                <div style={{ fontSize: "11px", color: "var(--olive-300)", display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
                  Online • Instant Resolution
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={handleResetChat}
                title="Restart Chat"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "4px"
                }}
              >
                ↺ Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "4px"
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="ai-modal-messages-area">
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.isAi ? "flex-start" : "flex-end"
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    backgroundColor: msg.isAi ? "var(--surface-white)" : "var(--olive-700)",
                    color: msg.isAi ? "var(--text-main)" : "#ffffff",
                    border: msg.isAi ? "1px solid var(--border-color)" : "none",
                    borderRadius: "14px",
                    borderTopLeftRadius: msg.isAi ? "2px" : "14px",
                    borderTopRightRadius: msg.isAi ? "14px" : "2px",
                    padding: "12px 14px",
                    fontSize: "13.5px",
                    lineHeight: "1.45",
                    boxShadow: "var(--shadow-sm)",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {msg.text}
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    marginTop: "3px",
                    padding: "0 4px"
                  }}
                >
                  {msg.sender} • {msg.timestamp}
                </div>

                {/* AI One-Click Ticket Escalation Card */}
                {msg.isAi && msg.ticketDraft && (
                  <div
                    style={{
                      marginTop: "8px",
                      maxWidth: "88%",
                      backgroundColor: "var(--olive-50)",
                      border: "1px dashed var(--olive-400)",
                      borderRadius: "8px",
                      padding: "10px 12px"
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--olive-900)", marginBottom: "4px" }}>
                      ⚡ Need official team action?
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-body)", marginBottom: "8px" }}>
                      I can immediately log a ticket with subject: <em>"{msg.ticketDraft.subject}"</em>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ fontSize: "12px", padding: "6px 12px", width: "100%" }}
                      onClick={() => handleConvertToTicket(msg.ticketDraft)}
                    >
                      ✓ Submit as Official Ticket
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "var(--surface-white)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "8px 14px",
                  fontSize: "12px",
                  color: "var(--olive-700)",
                  fontStyle: "italic",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span className="ai-pulse-dot" style={{ width: 6, height: 6 }}></span>
                OliveAI is analyzing your issue...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: "8px 12px", backgroundColor: "var(--beige-100)", borderTop: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--olive-800)", marginBottom: "4px" }}>
              Quick Suggestions:
            </div>
            <div className="ai-quick-chips-row">
              {AI_QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  className="ai-chip-button"
                  onClick={() => handleSendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="ai-chat-input-bar"
          >
            <input
              type="text"
              placeholder="Describe your issue or ask anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{ fontSize: "13px", padding: "8px 12px", marginBottom: 0 }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "13px", flexShrink: 0 }}
              disabled={!inputMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
