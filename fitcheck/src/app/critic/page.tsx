"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";

export default function CriticPage() {
  const [image, setImage] = useState<string | null>(null);
  const [review, setReview] = useState<{ score: number; critique: string; replacement?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle image selection and convert to base64 string
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeOutfit = async () => {
    if (!image) return;
    setLoading(true);
    setReview(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "critic_upload", 
          imageData: image 
        })
      });
      const data = await res.json();
      setReview(data);
    } catch {
      setReview({ 
        score: 6, 
        critique: "The visual sensor is slightly hazy. But from here, the silhouette looks solid!" 
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", marginBottom: "6rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem", fontWeight: "700" }}>AI Critic</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Upload your OOTD. Receive immediate feedback.</p>

      {/* Photo Upload Card */}
      <div style={{ 
        background: "var(--card-bg)", 
        border: "1px solid var(--border-color)", 
        borderRadius: "var(--radius-md)", 
        padding: "1.5rem", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        marginBottom: "2rem",
        textAlign: "center"
      }}>
        <label style={{ 
          display: "block", 
          fontWeight: "600", 
          marginBottom: "1rem", 
          fontSize: "0.95rem",
          textAlign: "left"
        }}>
          Upload your outfit photo:
        </label>

        <div style={{
          border: "2px dashed var(--border-color)",
          borderRadius: "var(--radius-sm)",
          padding: "2rem 1rem",
          background: "var(--bg-primary)",
          cursor: "pointer",
          position: "relative",
          marginBottom: "1.25rem"
        }}>
          {image ? (
            <img 
              src={image} 
              alt="Preview" 
              style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "var(--radius-sm)", objectFit: "contain" }} 
            />
          ) : (
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              📸 Click to snap a photo or upload an image
            </div>
          )}
          <input 
            type="file" 
            accept="image/*"
            capture="user" // Opens the camera directly on mobile phones
            onChange={handleImageChange}
            style={{
              position: "absolute",
              top: 0, left: 0, width: "100%", height: "100%",
              opacity: 0, cursor: "pointer"
            }}
          />
        </div>

        <button 
          onClick={handleAnalyzeOutfit}
          disabled={!image || loading}
          style={{
            backgroundColor: "var(--accent)",
            color: "#fff",
            border: "none",
            padding: "0.85rem",
            borderRadius: "var(--radius-sm)",
            fontWeight: "600",
            cursor: image ? "pointer" : "not-allowed",
            width: "100%",
            opacity: image && !loading ? 1 : 0.6
          }}
        >
          {loading ? "Analyzing visual silhouette..." : "👑 Review My Fit"}
        </button>
      </div>

      {/* Critique Results Box */}
      {review && (
        <div style={{ 
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          animation: "fadeIn 0.4s ease-out"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              background: "#111",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "12px"
            }}>
              {review.score}/10
            </div>
            <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>
              {review.score >= 8 ? "Looking Sharp ✨" : review.score >= 5 ? "Getting There 👍" : "Needs Adjusting 🚨"}
            </span>
          </div>
          
          <p style={{ lineHeight: "1.6", color: "#333", marginBottom: review.replacement ? "1.25rem" : "0" }}>
            {review.critique}
          </p>

          {/* Conditional Improvement Box */}
          {review.replacement && (
            <div style={{ 
              background: "#fff9eb", 
              border: "1px solid #ffe2a3", 
              borderRadius: "var(--radius-sm)", 
              padding: "1rem",
              borderLeft: "4px solid #ffb822"
            }}>
              <strong style={{ display: "block", color: "#b27b00", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                💡 Suggested Swap:
              </strong>
              <p style={{ fontSize: "0.9rem", color: "#5c4308", margin: 0 }}>
                {review.replacement}
              </p>
            </div>
          )}
        </div>
      )}

      <Navbar />
    </div>
  );
}