import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * AdNexus Support ChatWidget
 * ---------------------------
 * Floating support chatbot — talks to your FastAPI /api/chat endpoint
 * (see chat_router.py). Handles session persistence via localStorage,
 * quick-reply chips, typing indicator, and escalation banner.
 * Only renders on /dashboard* routes — hidden on landing/login/public pages.
 *
 * Usage: drop <ChatWidget /> once near the root of your app (e.g. in
 * App.jsx, inside <BrowserRouter> alongside <Routes>), pass userId if the
 * visitor is logged in so chats can be tied to their account.
 *
 * Adjust API_BASE to match your backend's base URL / axios instance.
 */

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "/api";

export default function ChatWidget({ userId = null }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [escalated, setEscalated] = useState(false);
  const scrollRef = useRef(null);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem("adnexus_chat_session");
    if (saved) {
      setSessionId(saved);
      fetchHistory(saved);
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! Main AdNexus support assistant hoon. Campaigns, leads, ya platform connection ke baare mein kuch bhi puch sakte ho.",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // Poll for the support team's reply while a query is pending and the
  // widget is open (Phase 1 — no LLM, admin replies asynchronously).
  useEffect(() => {
    if (!isOpen || !sessionId || !escalated) return;
    const interval = setInterval(() => fetchHistory(sessionId), 6000);
    return () => clearInterval(interval);
  }, [isOpen, sessionId, escalated]);

  async function fetchHistory(sid) {
    try {
      const res = await fetch(`${API_BASE}/chat/${sid}/history`);
      if (!res.ok) throw new Error("history fetch failed");
      const data = await res.json();
      if (data.length) {
        setMessages(data.map((m) => ({ role: m.role, content: m.content })));
        // stop polling once the support team has actually replied
        if (data.some((m) => m.role === "admin")) setEscalated(false);
      }
    } catch {
      // silent fail — falls back to fresh session on next send
    }
  }


  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, session_id: sessionId, user_id: userId }),
      });
      if (!res.ok) throw new Error("chat request failed");
      const data = await res.json();

      if (!sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem("adnexus_chat_session", data.session_id);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, quickReplies: data.quick_replies || [] },
      ]);
      if (data.escalate) setEscalated(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Kuch technical issue aa gaya. Thodi der baad try karo, ya humein WhatsApp pe message karo.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function clearChat() {
    localStorage.removeItem("adnexus_chat_session");
    setSessionId(null);
    setEscalated(false);
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! Main AdNexus support assistant hoon. Campaigns, leads, ya platform connection ke baare mein kuch bhi puch sakte ho.",
      },
    ]);
  }

  // Only show the widget on dashboard/app pages — hidden on landing, login, etc.
  const onDashboard = location.pathname.startsWith("/dashboard");

  // Toggle open/close when the topbar chat icon (in Dashboard.jsx etc.) dispatches this event
  useEffect(() => {
    const handler = () => setIsOpen((v) => !v);
    window.addEventListener("adnexus:toggle-chat", handler);
    return () => window.removeEventListener("adnexus:toggle-chat", handler);
  }, []);

  if (!onDashboard) return null;

  return (
    <div style={styles.wrapper}>
      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div>
              <div style={styles.headerTitle}>AdNexus Support</div>
              <div style={styles.headerSubtitle}>{escalated ? "Connecting you to the team" : "Usually replies instantly"}</div>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.clearBtn} onClick={clearChat} aria-label="Clear chat" title="Clear chat">
                Clear
              </button>
              <button style={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">
                ×
              </button>
            </div>
          </div>

          <div style={styles.messages} ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user" ? styles.userRow : styles.assistantRow}>
                {m.role === "admin" && <div style={styles.adminLabel}>Support Team</div>}
                <div style={m.role === "user" ? styles.userBubble : styles.assistantBubble}>{m.content}</div>
                {m.quickReplies?.length > 0 && (
                  <div style={styles.quickReplyRow}>
                    {m.quickReplies.map((q, qi) => (
                      <button key={qi} style={styles.quickReplyChip} onClick={() => sendMessage(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={styles.assistantRow}>
                <div style={styles.assistantBubble}>
                  <span style={styles.typingDot}>•</span>
                  <span style={{ ...styles.typingDot, animationDelay: "0.15s" }}>•</span>
                  <span style={{ ...styles.typingDot, animationDelay: "0.3s" }}>•</span>
                </div>
              </div>
            )}
          </div>

          <form
            style={styles.inputRow}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Apna sawaal likho..."
            />
            <button style={styles.sendBtn} type="submit" disabled={!input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
      `}</style>
    </div>
  );
}

const ACCENT = "#4F46E5"; // swap for your existing AdNexus brand accent
const ACCENT_DARK = "#3730A3";

const styles = {
  wrapper: { position: "fixed", top: 62, right: 24, zIndex: 1000, fontFamily: "inherit" },
  panel: {
    width: 300,
    maxWidth: "85vw",
    height: 400,
    maxHeight: "62vh",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 10px 32px rgba(17,24,39,0.16), 0 2px 8px rgba(17,24,39,0.06)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid rgba(17,24,39,0.06)",
  },
  header: {
    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
    color: "#fff",
    padding: "12px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" },
  headerSubtitle: { fontSize: 11, opacity: 0.8, marginTop: 1 },
  headerActions: { display: "flex", alignItems: "center", gap: 8 },
  clearBtn: {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    fontSize: 10.5,
    borderRadius: 10,
    padding: "3px 9px",
    cursor: "pointer",
  },
  closeBtn: { background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", lineHeight: 1, opacity: 0.9 },
  messages: { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8, background: "#FAFAFB" },
  userRow: { display: "flex", justifyContent: "flex-end" },
  assistantRow: { display: "flex", flexDirection: "column", alignItems: "flex-start" },
  userBubble: {
    background: ACCENT,
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "13px 13px 3px 13px",
    fontSize: 13,
    lineHeight: 1.45,
    maxWidth: "80%",
    boxShadow: "0 1px 2px rgba(79,70,229,0.25)",
  },
  assistantBubble: {
    background: "#fff",
    color: "#27272A",
    padding: "8px 12px",
    borderRadius: "13px 13px 13px 3px",
    fontSize: 13,
    lineHeight: 1.45,
    maxWidth: "80%",
    border: "1px solid #ECECEF",
    boxShadow: "0 1px 2px rgba(17,24,39,0.03)",
  },
  adminLabel: { fontSize: 10.5, color: "#9CA3AF", marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" },
  quickReplyRow: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 },
  quickReplyChip: {
    background: "#EEF2FF",
    color: ACCENT_DARK,
    border: `1px solid #DDD6FE`,
    borderRadius: 11,
    padding: "4px 9px",
    fontSize: 11.5,
    cursor: "pointer",
  },
  typingDot: { animation: "blink 1.2s infinite", fontSize: 18, lineHeight: "6px" },
  inputRow: { display: "flex", padding: 9, borderTop: "1px solid #F0F0F2", gap: 7, background: "#fff" },
  input: {
    flex: 1,
    border: "1px solid #E5E5E9",
    borderRadius: 18,
    padding: "8px 13px",
    fontSize: 13,
    outline: "none",
    background: "#FAFAFB",
  },
  sendBtn: {
    background: ACCENT,
    color: "#fff",
    border: "none",
    borderRadius: 18,
    padding: "8px 15px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};