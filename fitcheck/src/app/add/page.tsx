"use client";

import { useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function AddItemPage() {
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Tops");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first!");
      router.push("/login");
      setLoading(false);
      return;
    }

    let finalImageUrl = null;

    // 1. If the user selected a photo, upload it to Supabase Storage first
    if (imageFile) {
      // Create a unique file name to prevent overwriting
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("clothes") // This matches the bucket you just created
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("Error uploading image: " + uploadError.message);
        setLoading(false);
        return;
      }

      // 2. Get the public URL of the newly uploaded image
      const { data: publicUrlData } = supabase.storage
        .from("clothes")
        .getPublicUrl(fileName);
        
      finalImageUrl = publicUrlData.publicUrl;
    }

    // 3. Insert the item into the database with the new image URL
    const { error } = await supabase
      .from("items")
      .insert([
        { 
          name: itemName, 
          category: itemCategory, 
          image_url: finalImageUrl,
          user_id: user.id 
        }
      ]);

    if (error) {
      alert("Error adding item: " + error.message);
    } else {
      alert("✨ Added to your digital closet!");
      setItemName("");
      setImageFile(null);
      router.push("/closet");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", marginBottom: "6rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem", fontWeight: "700" }}>Add Piece</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Catalog a new item in your wardrobe.</p>

      <div style={{ 
        background: "var(--card-bg)", 
        border: "1px solid var(--border-color)", 
        borderRadius: "var(--radius-md)", 
        padding: "2rem", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)" 
      }}>
        <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              Garment Name
            </label>
            <input 
              type="text" 
              placeholder="e.g., Black Leather Jacket" 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              Category
            </label>
            <select 
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", backgroundColor: "#fff", outline: "none" }}
            >
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Footwear">Footwear</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* NEW: File Upload / Camera Input */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              Photo
            </label>
            <input 
              type="file" 
              accept="image/*"
              capture="environment" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImageFile(e.target.files[0]);
                }
              }}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border-color)", outline: "none", cursor: "pointer" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              border: "none",
              padding: "0.9rem",
              borderRadius: "var(--radius-sm)",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "0.5rem",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Uploading..." : "＋ Catalog Item"}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  );
}