"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalItems: 0, categories: {} as Record<string, number> });
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfileData() {
      // 1. Fetch current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, redirect them to sign up
        router.push("/login");
        return;
      }
      
      setUserEmail(user.email ?? "User");

      // 2. Fetch clothes uploaded exclusively by this user
      const { data } = await supabase
        .from("items")
        .select("category")
        .eq("user_id", user.id); // <-- Filters metrics dynamically for each individual account
      
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((item) => {
          if (item.category) counts[item.category] = (counts[item.category] || 0) + 1;
        });
        setStats({ totalItems: data.length, categories: counts });
      }
      setLoading(false);
    }
    loadProfileData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading profile...</div>;

  return (
    <div style={{ padding: "2rem", marginBottom: "6rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        {/* Cleaned layout avatar with corrected and optimized styling properties */}
        <div style={{ 
          width: "90px", 
          height: "90px", 
          borderRadius: "50%", 
          backgroundColor: "#111", 
          color: "#fff", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: "2rem", 
          fontWeight: "600", 
          margin: "0 auto 1rem auto" 
        }}>
          {userEmail?.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.25rem" }}>{userEmail}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Verified Member</p>
      </div>

      {/* Wardrobe Analytics */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem" }}>Wardrobe Analytics</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Your Items</span>
          <span style={{ fontSize: "1.5rem", fontWeight: "700" }}>{stats.totalItems}</span>
        </div>
      </div>

      <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "#fff", border: "none", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontWeight: "600", cursor: "pointer", width: "100%" }}>
        Log Out of Account
      </button>

      <Navbar />
    </div>
  );
}