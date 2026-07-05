"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Define our navigation links and cute emojis
  const navItems = [
    { name: "Closet", path: "/closet", emoji: "👗" },
    { name: "Add", path: "/add", emoji: "✨" },
    { name: "Profile", path: "/profile", emoji: "🎀" }
  ];

  return (
    <nav style={{
      position: "fixed",
      bottom: "2rem", // Floats slightly above the bottom of the screen
      left: "50%",
      transform: "translateX(-50%)", // Perfectly centers it
      display: "flex",
      gap: "2rem",
      padding: "0.75rem 2rem",
      background: "rgba(255, 255, 255, 0.7)", // Frosted glass!
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)", // For Safari support
      borderRadius: "999px", // Makes it a perfect pill shape
      boxShadow: "0 8px 32px rgba(255, 182, 193, 0.3)", // Soft pink shadow
      border: "1.5px solid rgba(255, 255, 255, 0.9)",
      zIndex: 1000 // Ensures it stays on top of your clothes
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link href={item.path} key={item.name} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
              // If we are on this page, make it deep pink. Otherwise, muted mauve.
              color: isActive ? "#d81b60" : "#887a8c",
              transition: "all 0.2s ease",
              transform: isActive ? "scale(1.1)" : "scale(1)" // Slight pop effect when active!
            }}>
              <span style={{ fontSize: "1.25rem" }}>{item.emoji}</span>
              <span style={{ 
                fontSize: "0.7rem", 
                fontWeight: isActive ? "700" : "500",
                letterSpacing: "0.02em"
              }}>
                {item.name}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}