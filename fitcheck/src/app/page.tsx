"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ 
      padding: "2rem", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "80vh",
      textAlign: "center" 
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Welcome to FitCheck</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Your digital wardrobe assistant.</p>
      
      <Link href="/closet" style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "#000",
        color: "#fff",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "bold"
      }}>
        Open My Closet
      </Link>
    </div>
  );
}