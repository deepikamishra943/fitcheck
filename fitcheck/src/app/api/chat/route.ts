import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { action, imageData, message, closetItems } = await request.json();

    // Image Upload Critic Action
    if (action === "critic_upload") {
      if (!imageData) {
        return NextResponse.json({ score: 4, critique: "I can't critique a ghost. Please provide an outfit picture!" });
      }

      // Simulated computer-vision breakdown
      const score = 7.5;
      const critique = "The proportions here are looking incredibly clean, and the color coordination works nicely. However, the styling feels a tiny bit casual for a polished statement look.";
      
      // Only include replacement logic when an improvement is explicitly needed
      const replacement = "Consider swapping out the relaxed footwear for a pair of structured leather boots or clean loafers, and add a minimalist chain to elevate the neckline.";

      return NextResponse.json({ score, critique, replacement });
    }

    // Existing Critic Module
    if (action === "critic") {
      return NextResponse.json({ score: 7, critique: "Staple look. Safe but clean." });
    }

    // Existing Outfit Generator Module
    if (action === "generate") {
      return NextResponse.json({ text: "✨ AI Combo suggestion: Try styling your favorite clean layers today!" });
    }

    return NextResponse.json({ text: "Hello from the stylist dashboard!" });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}