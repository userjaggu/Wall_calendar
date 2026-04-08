import React from "react";

export default function SpiralBinding({ isDark }) {
  const ringCount = 17;

  return (
    <div
      className="spiral-binding"
      style={{
        height: 32,
        position: "relative",
        zIndex: 10,
        background: isDark
          ? "linear-gradient(180deg, #080810 0%, #0f0f1e 60%, #0c0c18 100%)"
          : "linear-gradient(180deg, #c8d0de 0%, #dde5f0 60%, #cad2e0 100%)",
        borderBottom: `1px solid ${isDark ? "#1a1a2a" : "#b8c4d4"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        paddingInline: 40,
        overflow: "hidden",
      }}
    >
      {/* Binding rail */}
      <div style={{
        position: "absolute",
        left: 20, right: 20,
        top: "50%", height: 3,
        transform: "translateY(-50%)",
        background: isDark
          ? "linear-gradient(90deg, #1a1a2a 0%, #2a2a3e 50%, #1a1a2a 100%)"
          : "linear-gradient(90deg, #9aaabb 0%, #b8c8d8 50%, #9aaabb 100%)",
        borderRadius: 2,
      }}/>

      {Array.from({ length: ringCount }).map((_, i) => (
        <div key={i} style={{
          width: 16, height: 16, borderRadius: "50%",
          flexShrink: 0, position: "relative", zIndex: 2,
          background: isDark
            ? "radial-gradient(circle at 35% 30%, #4a4a6e 0%, #22223a 40%, #0a0a18 100%)"
            : "radial-gradient(circle at 35% 30%, #d8e4f0 0%, #a8b8cc 40%, #7888a0 100%)",
          border: `1.5px solid ${isDark ? "#2a2a4a" : "#8898b0"}`,
          boxShadow: isDark
            ? "0 2px 6px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.06)"
            : "0 2px 6px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.5)",
        }}>
          {/* Inner hole — FIXED hex (was "#6878900") */}
          <div style={{
            position: "absolute", inset: "4px", borderRadius: "50%",
            background: isDark ? "#040408" : "#687890",  // ← fixed valid hex
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.8)",
          }}/>
          {/* Glint */}
          <div style={{
            position: "absolute", top: 2, left: 3,
            width: 5, height: 3, borderRadius: "50%",
            background: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.65)",
            transform: "rotate(-20deg)",
          }}/>
        </div>
      ))}
    </div>
  );
}
