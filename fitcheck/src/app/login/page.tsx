"use client";

import { useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setErrorMsg(error.message);
      else alert("Check your email for a confirmation link!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrorMsg(error.message);
      else router.push("/closet");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "90vh" }}>
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", width: "100%", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.5rem", textAlign: "center" }}>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem", textAlign: "center" }}>
          {isSignUp ? "Join FitCheck to manage your digital wardrobe" : "Log in to view your closet"}
        </p>

        {errorMsg && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "1rem", backgroundColor: "#fef2f2", padding: "0.5rem", borderRadius: "6px" }}>{errorMsg}</p>}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", outline: "none" }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", outline: "none" }} />
          
          <button type="submit" disabled={loading} style={{ backgroundColor: "var(--accent)", color: "#fff", border: "none", padding: "0.85rem", borderRadius: "var(--radius-sm)", fontWeight: "600", cursor: "pointer", marginTop: "0.5rem" }}>
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "1.5rem", color: "var(--text-secondary)" }}>
          {isSignUp ? "Already have an account?" : "New to FitCheck?"}{" "}
          <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: "#000", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
            {isSignUp ? "Log In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}