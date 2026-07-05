"use client";

import { useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function AddItemPage() {
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Tops");
  const [itemVibe, setItemVibe] = useState("Campus Casual");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Your Supabase Storage and Insert logic goes here!
    // Example: supabase.storage.from("closet").upload(...)
    // Example: supabase.from("items").insert(...)

    setLoading(false);
    router.push("/closet");
  };

  // Reusable style for all inputs to keep them looking soft and cohesive
  const inputStyle = {
    width: "100%",
    padding: "0.85rem 1rem",
    borderRadius: "16px",
    border: "1.5px solid #fecdd3",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#5a4b59",
    outline: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "border 0.2s ease"
  };

  return (
    <div style={{ padding: "2rem 1rem", marginBottom: "6rem", maxWidth: "600px", margin: "0 auto" }}>
      
      <h1 style={{ fontSize: "2.2rem", marginBottom: "0.25rem", fontWeight: "700", color: "#d81b60" }}>
        Add to Closet 🎀
      </h1>
      <p style={{ color: "#887a8c", marginBottom: "2rem", paddingLeft: "4px" }}>
        Upload a new piece to your digital wardrobe.
      </p>

      {/* 💖 THE GLASSMORPHISM FORM CARD 💖 */}
      <div style={{
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(12px)",
        border: "1.5px solid rgba(255, 255, 255, 0.9)",
        borderRadius: "24px",
        padding: "2rem 1.5rem",
        boxShadow: "0 8px 32px rgba(255, 182, 193, 0.25)"
      }}>
        <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Image Upload Area */}
          <div>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "0.5rem", color: "#d81b60", fontSize: "0.9rem" }}>
              Snap a Photo 📸
            </label>
            <div style={{
              border: "2px dashed #fecdd3",
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              cursor: "pointer"
            }}>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" // Opens the mobile camera directly!
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ width: "100%", color: "#887a8c", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "0.5rem", color: "#d81b60", fontSize: "0.9rem" }}>
              Item Name ✨
            </label>
            <input 
              type="text" 
              placeholder="e.g. Pink Floral Kurti" 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "0.5rem", color: "#d81b60", fontSize: "0.9rem" }}>
              Category 👗
            </label>
            <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} style={inputStyle}>
              <option value="Tops">Tops (T-Shirts, Shirts, Blouses)</option>
              <option value="Bottoms">Bottoms (Jeans, Pants, Skirts)</option>
              <option value="Dresses">Dresses & Jumpsuits</option>
              <option value="Kurti & Ethnic">Kurti & Ethnic Sets</option>
              <option value="Outerwear">Outerwear (Jackets, Pullovers)</option>
              <option value="Activewear">Activewear & Lounge</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Vibe / Occasion Dropdown */}
          <div>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "0.5rem", color: "#d81b60", fontSize: "0.9rem" }}>
              Vibe / Occasion 🥂
            </label>
            <select value={itemVibe} onChange={(e) => setItemVibe(e.target.value)} style={inputStyle}>
              <option value="Campus Casual">Campus Casual (Classes / Daily)</option>
              <option value="Streetwear">Streetwear / Aesthetic</option>
              <option value="Indo-Western">Indo-Western Fusion</option>
              <option value="Smart Casual">Smart Casual (Presentations / Events)</option>
              <option value="Festive">Festive (Traditional / Heavy)</option>
              <option value="Night Out">Night Out</option>
              <option value="Lounge">Lounge / Home</option>
            </select>
          </div>

          {/* Cute Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "1rem",
              borderRadius: "999px",
              backgroundColor: "#d81b60",
              color: "#fff",
              border: "none",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(216, 27, 96, 0.3)",
              transition: "transform 0.2s ease, opacity 0.2s ease",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Adding to Closet... 🎀" : "Save to Closet ✨"}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  );
}