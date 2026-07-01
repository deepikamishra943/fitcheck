"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Closet", path: "/closet", icon: "🧥" },
    { name: "Add", path: "/add", icon: "＋" },
    { name: "Stylist", path: "/stylist", icon: "✨" },
    { name: "Critic", path: "/critic", icon: "👑" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: "450px",
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(234, 232, 228, 0.7)",
      borderRadius: "24px",
      padding: "10px 16px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
      zIndex: 9999,
    }}>
      <nav style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center"
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textDecoration: "none",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "14px",
                backgroundColor: isActive ? "#111" : "transparent",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <span style={{ 
                fontSize: "1.2rem",
                filter: isActive ? "brightness(1) invert(1)" : "none"
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: "10px",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#fff" : "#6b7280",
                letterSpacing: "0.02em"
              }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}