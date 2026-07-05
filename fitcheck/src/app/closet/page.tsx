"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function ClosetPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track which filter button is clicked
  const [activeFilter, setActiveFilter] = useState("All");
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchCloset() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id); 

      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    }
    fetchCloset();
  }, [supabase, router]);

  // NEW: Filter the items before displaying them
  const displayedItems = activeFilter === "All" 
    ? items 
    : items.filter(item => item.vibe === activeFilter);

  // The vibes array for our buttons
  const vibes = [
    { name: "All", emoji: "✨" }, 
    { name: "Campus Casual", emoji: "📚" }, 
    { name: "Streetwear", emoji: "🎧" }, 
    { name: "Indo-Western", emoji: "🪷" }, 
    { name: "Festive", emoji: "🎇" }, 
    { name: "Night Out", emoji: "🥂" }, 
    { name: "Lounge", emoji: "🧸" }
  ];

  return (
    <div style={{ padding: "2rem 1rem", marginBottom: "6rem", maxWidth: "800px", margin: "0 auto" }}>
      
      <h1 style={{ fontSize: "2.2rem", marginBottom: "0.25rem", fontWeight: "700", color: "#d81b60" }}>
        My Closet ✨
      </h1>
      <p style={{ color: "#887a8c", marginBottom: "1.5rem", paddingLeft: "4px" }}>
        Your curated physical collection, digitized.
      </p>

      {/* 💖 THE CUTE FILTER BUTTONS 💖 */}
      <div style={{ 
        display: "flex", 
        gap: "0.75rem", 
        overflowX: "auto", 
        paddingBottom: "1rem", 
        marginBottom: "1rem",
        scrollbarWidth: "none" 
      }}>
        {vibes.map(vibe => {
          const isActive = activeFilter === vibe.name;
          return (
            <button 
              key={vibe.name}
              onClick={() => setActiveFilter(vibe.name)}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "999px",
                // If it's clicked, make it solid pink. If not, make it frosted white!
                backgroundColor: isActive ? "#d81b60" : "rgba(255, 255, 255, 0.8)",
                border: isActive ? "1px solid #d81b60" : "1px solid #fecdd3",
                color: isActive ? "#fff" : "#d81b60",
                whiteSpace: "nowrap",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                boxShadow: "0 2px 10px rgba(255, 182, 193, 0.2)",
                transition: "all 0.2s ease"
              }}
            >
              {vibe.emoji} {vibe.name}
            </button>
          )
        })}
      </div>

      {loading ? (
        <p style={{ color: "#887a8c", textAlign: "center", marginTop: "2rem" }}>Opening wardrobe doors... 🎀</p>
      ) : items.length === 0 ? (
        <div style={{ 
          background: "rgba(255, 255, 255, 0.6)", 
          border: "2px dashed #fecdd3", 
          borderRadius: "24px", 
          padding: "3rem 1rem", 
          textAlign: "center",
          color: "#d81b60",
          fontWeight: "500"
        }}>
          ✨ Your closet is currently empty. Tap "Add" to catalog your first item!
        </div>
      ) : (
        /* 💖 THE MASONRY GRID 💖 */
        <div style={{ 
          columnCount: 2, 
          columnGap: "1rem" 
        }}>
          {displayedItems.map((item) => (
            /* 💖 THE GLASSMORPHISM CARDS 💖 */
            <div key={item.id} className="clothing-card" style={{
              breakInside: "avoid",
              marginBottom: "1rem",
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid rgba(255, 255, 255, 0.9)",
              borderRadius: "24px",
              padding: "10px",
              boxShadow: "0 8px 32px rgba(255, 182, 193, 0.25)",
              animation: "fadeIn 0.4s ease-out"
            }}>
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  /* Changed height to "auto" so kurtis don't get cropped! */
                  style={{ width: "100%", height: "auto", borderRadius: "16px", marginBottom: "0.75rem" }} 
                />
              ) : (
                <div style={{ width: "100%", aspectRatio: "3/4", background: "rgba(255,255,255,0.8)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "0.75rem" }}>
                  👗
                </div>
              )}
              <div style={{ padding: "0 4px 4px 4px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.15rem", color: "#5a4b59" }}>
                  {item.name}
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#d81b60", fontWeight: "600" }}>
                  {item.category} {item.vibe ? `• ${item.vibe}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Navbar />
    </div>
  );
}