"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import Navbar from "../../components/Navbar";

export default function StylistPage() {
  const [closetItems, setClosetItems] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingOutfit, setLoadingOutfit] = useState(false);
  
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hey there! Ask me anything about your wardrobe, or tell me where you're heading today!" }
  ]);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const supabase = createClient();

  // Load actual items from database to supply to the AI context
  useEffect(() => {
    async function loadItems() {
      const { data } = await supabase.from("items").select("*");
      if (data) setClosetItems(data);
    }
    loadItems();
  }, [supabase]);

  // 1. Real API call for Outfit Generator
  const generateOutfit = async () => {
    setLoadingOutfit(true);
    setSuggestion(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", closetItems })
      });
      const data = await res.json();
      setSuggestion(data.text);
    } catch {
      setSuggestion("Oops, couldn't reach the stylist right now.");
    }
    setLoadingOutfit(false);
  };

  // 2. Real API call for AI Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setChatInput("");
    setLoadingChat(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, closetItems })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.text }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I had trouble processing that request." }]);
    }
    setLoadingChat(false);
  };

  return (
    <div style={{ padding: "2rem", marginBottom: "6rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>AI Stylist</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Your personal wardrobe consultant.</p>

      {/* Outfit Generator Card */}
      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Instant Mix & Match</h2>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>Let AI scan your closet and build an outfit combo.</p>
        <button onClick={generateOutfit} disabled={loadingOutfit} style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", width: "100%" }}>
          {loadingOutfit ? "Scanning Closet..." : "⚡ Generate Outfit"}
        </button>
        {suggestion && <div style={{ marginTop: "1rem", padding: "1rem", background: "#fff", borderRadius: "8px", borderLeft: "4px solid #000", textAlign: "left", fontSize: "0.95rem" }}>{suggestion}</div>}
      </div>

      {/* Chat UI */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "16px", display: "flex", flexDirection: "column", height: "400px", background: "#fff" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>💬 Ask the Stylist</div>
        <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", backgroundColor: msg.role === "user" ? "#000" : "#f3f4f6", color: msg.role === "user" ? "#fff" : "#000", padding: "0.75rem 1rem", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", maxWidth: "80%", fontSize: "0.9rem" }}>
              {msg.text}
            </div>
          ))}
          {loadingChat && <div style={{ alignSelf: "flex-start", color: "#9ca3af", fontSize: "0.85rem", fontStyle: "italic" }}>Stylist is thinking...</div>}
        </div>
        <form onSubmit={handleSendMessage} style={{ display: "flex", padding: "0.75rem", borderTop: "1px solid #e5e7eb" }}>
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask: 'What should I wear to brunch tomorrow?'" style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "8px", marginRight: "0.5rem", outline: "none" }} />
          <button type="submit" style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Send</button>
        </form>
      </div>
      <Navbar />
    </div>
  );
}