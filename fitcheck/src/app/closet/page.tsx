"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function ClosetPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchCloset() {
      // 1. Get the current logged-in user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Force redirect to login if they aren't authenticated
        router.push("/login");
        return;
      }

      // 2. Fetch ONLY items that belong to this user
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id); // <-- Crucial: Separates users securely

      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    }
    fetchCloset();
  }, [supabase, router]);

  return (
    <div style={{ padding: "2rem", marginBottom: "6rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem", fontWeight: "700" }}>Your Closet</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Your curated physical collection, digitized.</p>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Opening wardrobe doors...</p>
      ) : items.length === 0 ? (
        <div style={{ 
          background: "var(--card-bg)", 
          border: "1px dashed var(--border-color)", 
          borderRadius: "var(--radius-md)", 
          padding: "3rem 1rem", 
          textAlign: "center",
          color: "var(--text-secondary)"
        }}>
          ✨ Your closet is currently empty. Tap "Add" to catalog your first item!
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {items.map((item) => (
            <div key={item.id} style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.01)",
              animation: "fadeIn 0.3s ease-out"
            }}>
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: "0.75rem" }} 
                />
              ) : (
                <div style={{ width: "100%", height: "140px", background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                  🧥
                </div>
              )}
              <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "0.25rem" }}>{item.name}</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>{item.category}</span>
            </div>
          ))}
        </div>
      )}

      <Navbar />
    </div>
  );
}