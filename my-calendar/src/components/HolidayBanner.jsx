import React from "react";
import { HOLIDAYS, MONTH_THEMES } from "../constants";

export default function HolidayBanner({ month, year, isDark }) {
  const T = MONTH_THEMES[month];

  const monthHolidays = Object.entries(HOLIDAYS)
    .filter(([key]) => key.startsWith(`${month + 1}-`))
    .map(([key, val]) => {
      const day = parseInt(key.split("-")[1], 10);
      return { ...val, day, date: new Date(year, month, day) };
    })
    .sort((a, b) => a.day - b.day);

  if (!monthHolidays.length) return null;

  return (
    <div style={{
      padding: "8px 16px",
      borderBottom: `1px solid ${isDark ? "#1a1a28" : "#eef1f6"}`,
      display: "flex", alignItems: "center", gap: 6,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",  // smooth iOS scrolling
      background: isDark ? `${T.glow}08` : `${T.accent}07`,
      scrollbarWidth: "none",
    }}>
      <style>{`
        .holiday-strip::-webkit-scrollbar { display: none; }
      `}</style>

      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
        color: isDark ? "#333354" : "#c8d0dc",   // fixed: was near-invisible in dark mode
        textTransform: "uppercase", flexShrink: 0, marginRight: 4,
      }}>
        This Month
      </span>

      {monthHolidays.map(h => (
        <div
          key={h.day}
          title={`${h.name} — ${h.day} ${MONTH_THEMES[month].name}`}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px",        // slightly taller for touch
            borderRadius: 20, flexShrink: 0,
            background: isDark ? "#111120" : "#f5f7fc",
            border: `1px solid ${h.color}44`,
            cursor: "default",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform  = "translateY(-1px)";
            e.currentTarget.style.boxShadow  = `0 4px 12px ${h.color}33`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform  = "translateY(0)";
            e.currentTarget.style.boxShadow  = "none";
          }}
        >
          <span style={{ fontSize: 13 }}>{h.emoji}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: isDark ? "#aaa" : "#555" }}>
            {h.name}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: h.color,
            background: `${h.color}20`, padding: "1px 5px", borderRadius: 8,
          }}>
            {h.day}
          </span>
        </div>
      ))}
    </div>
  );
}
