import React from "react";
import { formatDate } from "../utils/dateUtils";
import { MONTH_THEMES } from "../constants";

export default function StatsBar({
  month, rangeStart, rangeEnd, selecting, rangeDays, notesList, isDark, onCopyRange,
}) {
  const T = MONTH_THEMES[month];

  const status = !rangeStart
    ? { label: "Ready",     icon: "○", color: isDark ? "#333354" : "#c8d0dc" }
    : !rangeEnd
    ? { label: "Pick end…", icon: "◎", color: T.accent }
    : { label: "Complete",  icon: "●", color: "#10B981" };

  const stats = [
    { label: "Start",    value: rangeStart ? formatDate(rangeStart, "short") : "—", icon: "▶", color: T.accent  },
    { label: "End",      value: rangeEnd   ? formatDate(rangeEnd, "short")   : "—", icon: "◀", color: T.glow    },
    { label: "Duration", value: rangeDays > 0 ? `${rangeDays}d` : "—",            icon: "↔", color: "#F59E0B" },
    { label: "Notes",    value: notesList.length > 0 ? notesList.length : "—",    icon: "📌", color: "#EC4899" },
  ];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "8px 16px",
      gap: 6,
      borderBottom: `1px solid ${isDark ? "#1a1a28" : "#eef1f6"}`,
      background: isDark
        ? `linear-gradient(90deg, ${T.glow}0a 0%, transparent 100%)`
        : `linear-gradient(90deg, ${T.accent}08 0%, transparent 100%)`,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",   // smooth scroll on iOS
      flexWrap: "nowrap",
      scrollbarWidth: "none",
    }}>
      <style>{`.stats-scroll::-webkit-scrollbar { display: none; }`}</style>

      {stats.map(s => (
        <div key={s.label} style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 10px",
          borderRadius: 20,
          background: isDark ? "#111120" : "#f5f7fc",
          border: `1px solid ${isDark ? "#1e1e2e" : "#e8edf5"}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 9, color: s.color }}>{s.icon}</span>
          <span style={{
            fontSize: 10, color: isDark ? "#444" : "#bbb",
            fontWeight: 600, letterSpacing: 0.5,
          }}>{s.label}</span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: s.value === "—" ? (isDark ? "#2a2a3a" : "#dde3ea") : (isDark ? "#d0d0e0" : "#2d3748"),
          }}>{s.value}</span>
        </div>
      ))}

      {/* Copy range button — only shown when range is complete */}
      {rangeStart && rangeEnd && (
        <button
          onClick={onCopyRange}
          title="Copy date range to clipboard"
          style={{
            padding: "5px 12px", borderRadius: 20, flexShrink: 0,
            border: `1px solid ${T.accent}55`,
            background: isDark ? `${T.accent}18` : `${T.accent}10`,
            color: T.accent, fontSize: 10, fontWeight: 700,
            cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 5,
            minHeight: 30,
          }}
          onMouseEnter={e => e.currentTarget.style.background = isDark ? `${T.accent}28` : `${T.accent}1e`}
          onMouseLeave={e => e.currentTarget.style.background = isDark ? `${T.accent}18` : `${T.accent}10`}
        >
          📋 Copy
        </button>
      )}

      {/* Status pill — push to far right */}
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 20,
          background: status.label === "Complete"
            ? (isDark ? "#10B98120" : "#10B98115")
            : (isDark ? "#111120" : "#f5f7fc"),
          border: `1px solid ${status.color}40`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: status.color,
            boxShadow: status.label === "Complete" ? `0 0 6px ${status.color}` : "none",
            display: "inline-block",
            animation: status.label === "Pick end…" ? "pulse 1.2s ease-in-out infinite" : "none",
          }}/>
          <span style={{ fontSize: 10, fontWeight: 700, color: status.color, letterSpacing: 0.5 }}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}
