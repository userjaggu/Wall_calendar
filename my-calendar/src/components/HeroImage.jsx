import React, { useState, useEffect, useRef } from "react";
import { MONTH_THEMES, QUOTES } from "../constants";

export default function HeroImage({
  month, year, onNavigate, imgLoaded, setImgLoaded, animDir, animating, isDark,
}) {
  const T = MONTH_THEMES[month];
  const [tilt,    setTilt]    = useState({ x: 0, y: 0 });
  const [imgTilt, setImgTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // 3D tilt — desktop/mouse only
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;

    const el = heroRef.current;
    if (!el) return;

    const handleMove = (e) => {
      const r  = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      setTilt({ x: ny * 6, y: nx * -6 });
      setImgTilt({ x: nx * 14, y: ny * -8 });
    };
    const handleLeave = () => {
      setTilt({ x: 0, y: 0 });
      setImgTilt({ x: 0, y: 0 });
    };
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const quote = QUOTES[month];

  // Swipe-to-navigate on mobile
  const touchStartX = useRef(null);

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return; // ignore small movements
    onNavigate(dx < 0 ? 1 : -1);
  }

  return (
    <div
      ref={heroRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        height: "clamp(190px, 28vw, 320px)",
        overflow: "hidden",
        transformStyle: "preserve-3d",
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: animating
          ? "transform 0.42s cubic-bezier(.4,0,.2,1)"
          : "transform 0.12s ease-out",
        touchAction: "pan-y",  // allow vertical scroll on mobile but detect horizontal swipe
      }}
    >
      {/* Parallax photo */}
      <div style={{
        position: "absolute", inset: "-8%",
        transform: `translate(${imgTilt.x}px, ${imgTilt.y}px)`,
        transition: "transform 0.12s ease-out",
        willChange: "transform",
      }}>
        <img
          src={T.img}
          alt={T.name}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.75s ease",
            display: "block",
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.65) 100%),
          linear-gradient(135deg, ${T.glow}18 0%, transparent 60%)
        `,
      }}/>

      {/* Season badge */}
      <div style={{ position: "absolute", top: 18, left: 22 }}>
        <div style={{
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20, padding: "4px 12px",
          fontSize: 10, color: "rgba(255,255,255,0.85)",
          fontWeight: 600, letterSpacing: 1.5,
          textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: T.accent, display: "inline-block",
            boxShadow: `0 0 6px ${T.accent}`,
          }}/>
          {T.season} · {T.mood}
        </div>
      </div>

      {/* Month + Year */}
      <div style={{
        position: "absolute", bottom: 52, left: 0, right: 0,
        padding: "0 24px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      }}>
        <div>
          <div style={{
            fontSize: "clamp(32px, 6vw, 64px)",
            fontWeight: 900, color: "#fff", lineHeight: 0.95,
            letterSpacing: -3,
            textShadow: `0 2px 30px rgba(0,0,0,0.5), 0 0 60px ${T.glow}44`,
            fontFamily: "'Playfair Display', serif",
          }}>
            {T.name.toUpperCase()}
          </div>
          <div style={{
            fontSize: "clamp(11px, 1.8vw, 14px)",
            color: "rgba(255,255,255,0.55)",
            fontWeight: 400, letterSpacing: 8, marginTop: 4,
          }}>
            {year}
          </div>
        </div>

        {/* Days-in-month glass card */}
        <div style={{
          background: "rgba(0,0,0,0.32)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 16, padding: "12px 18px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}>
          <div style={{
            fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1,
            fontFamily: "'Playfair Display', serif",
          }}>
            {new Date(year, month + 1, 0).getDate()}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, marginTop: 3 }}>
            DAYS
          </div>
        </div>
      </div>

      {/* Quote strip */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        padding: "6px 24px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ color: T.accent, fontSize: 14, flexShrink: 0 }}>"</span>
        <span style={{
          fontSize: 11, color: "rgba(255,255,255,0.6)",
          fontStyle: "italic", fontWeight: 300, flex: 1,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {quote.text}
        </span>
        <span style={{
          fontSize: 10, color: T.accent, fontWeight: 600,
          flexShrink: 0, letterSpacing: 0.5,
        }}>
          — {quote.author}
        </span>
      </div>

      {/* SVG wave */}
      <svg
        style={{ position: "absolute", bottom: -1, left: 0, width: "100%", overflow: "visible" }}
        viewBox="0 0 1000 56" preserveAspectRatio="none" height={56}
      >
        <path
          d="M0,56 L0,28 C80,10 160,40 250,22 C340,4 420,36 500,18 C580,0 660,32 750,20 C840,8 920,38 1000,24 L1000,56 Z"
          fill={isDark ? "#0c0c18" : "#ffffff"}
        />
        <path
          d="M0,56 L0,34 C80,18 160,46 250,30 C340,14 420,42 500,26 C580,10 660,38 750,28 C840,18 920,44 1000,32 L1000,56 Z"
          fill={T.accent} opacity={0.12}
        />
      </svg>

      {/* Nav arrows — responsive size */}
      {[{ dir: -1, icon: "←", side: "left" }, { dir: 1, icon: "→", side: "right" }].map(({ dir, icon, side }) => (
        <button
          key={side}
          onClick={() => onNavigate(dir)}
          aria-label={`${dir === -1 ? "Previous" : "Next"} month`}
          style={{
            position: "absolute", top: "50%", [side]: 12,
            transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 14,
            // clamp size: 36px on mobile, 46px on desktop
            width: "clamp(36px, 5vw, 46px)",
            height: "clamp(36px, 5vw, 46px)",
            color: "#fff", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.22)";
            e.currentTarget.style.transform  = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(0,0,0,0.28)";
            e.currentTarget.style.transform  = "translateY(-50%) scale(1)";
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
