import React from "react";
import { MONTH_THEMES } from "../constants";
import { getDaysInMonth, getFirstDayOfWeek, sameDay, inRange } from "../utils/dateUtils";

function MiniMonthGrid({ year, month, rangeStart, rangeEnd, accent, isDark, onClick }) {
  const days  = getDaysInMonth(year, month);
  const first = getFirstDayOfWeek(year, month);
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  return (
    <div style={{ fontSize: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 2 }}>
        {"MTWTFSS".split("").map((d, i) => (
          <div key={i} style={{
            textAlign: "center", fontSize: 7, fontWeight: 800,
            color: i >= 5 ? accent : (isDark ? "#333" : "#ccc"),
          }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`}/>;
          const d   = new Date(year, month, day);
          const isS = sameDay(d, rangeStart);
          const isE = sameDay(d, rangeEnd);
          const inR = inRange(d, rangeStart, rangeEnd);
          return (
            <div key={day} style={{
              textAlign: "center", fontSize: 7, lineHeight: "13px",
              borderRadius: 2,
              background: (isS || isE) ? accent : inR ? `${accent}33` : "transparent",
              color: (isS || isE) ? "#fff" : (isDark ? "#888" : "#555"),
              fontWeight: (isS || isE) ? 800 : 400,
            }}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MiniYearView({
  year, setYear, currentMonth, goToMonth, rangeStart, rangeEnd, isDark, onBack,
}) {
  return (
    <div style={{ padding: "20px 18px 18px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      {/* Header with back button */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: `1px solid ${isDark ? "#1e1e2e" : "#e0e5ea"}`,
            borderRadius: 8, padding: "5px 14px",
            color: isDark ? "#666" : "#aaa",
            cursor: "pointer", fontSize: 11, fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 5,
            minHeight: 36,
          }}
        >
          ← Back
        </button>

        {/* Year navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setYear(y => y - 1)} style={{
            background: "none", border: `1px solid ${isDark ? "#1e1e2e" : "#e0e5ea"}`,
            borderRadius: 8, padding: "5px 14px",
            color: isDark ? "#666" : "#aaa", cursor: "pointer", fontSize: 12,
            fontFamily: "inherit", minHeight: 36,
          }}>‹</button>

          <div style={{
            fontSize: "clamp(24px, 4vw, 40px)",
            fontWeight: 900,
            background: `linear-gradient(135deg, ${MONTH_THEMES[currentMonth].accent}, ${MONTH_THEMES[currentMonth].glow})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -2,
            fontFamily: "'Playfair Display', serif",
          }}>
            {year}
          </div>

          <button onClick={() => setYear(y => y + 1)} style={{
            background: "none", border: `1px solid ${isDark ? "#1e1e2e" : "#e0e5ea"}`,
            borderRadius: 8, padding: "5px 14px",
            color: isDark ? "#666" : "#aaa", cursor: "pointer", fontSize: 12,
            fontFamily: "inherit", minHeight: 36,
          }}>›</button>
        </div>

        {/* Spacer to balance layout */}
        <div style={{ width: 80 }}/>
      </div>

      {/* 12-month grid — responsive min cell size */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 12,
      }}>
        {Array.from({ length: 12 }, (_, m) => {
          const T          = MONTH_THEMES[m];
          const isCurrentM = m === currentMonth;
          return (
            <div
              key={m}
              onClick={() => goToMonth(m, year)}
              role="button"
              tabIndex={0}
              aria-label={`Go to ${T.name} ${year}`}
              onKeyDown={e => e.key === "Enter" && goToMonth(m, year)}
              style={{
                borderRadius: 14, overflow: "hidden", cursor: "pointer",
                border: `2px solid ${isCurrentM ? T.accent : (isDark ? "#1a1a28" : "#e8edf5")}`,
                boxShadow: isCurrentM ? `0 8px 28px ${T.accent}44` : "none",
                transition: "all 0.2s ease",
                background: isDark ? "#0e0e1c" : "#fff",
              }}
              onMouseEnter={e => {
                if (!isCurrentM) {
                  e.currentTarget.style.borderColor = T.accent;
                  e.currentTarget.style.transform   = "translateY(-3px)";
                  e.currentTarget.style.boxShadow   = `0 12px 32px ${T.accent}33`;
                }
              }}
              onMouseLeave={e => {
                if (!isCurrentM) {
                  e.currentTarget.style.borderColor = isDark ? "#1a1a28" : "#e8edf5";
                  e.currentTarget.style.transform   = "translateY(0)";
                  e.currentTarget.style.boxShadow   = "none";
                }
              }}
            >
              {/* Photo thumbnail — reduced height for mobile */}
              <div style={{ height: "clamp(50px, 9vw, 70px)", overflow: "hidden", position: "relative" }}>
                <img
                  src={T.img}
                  alt={T.name}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55) 100%)",
                }}/>
                <div style={{
                  position: "absolute", bottom: 4, left: 7,
                  fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: 1,
                }}>
                  {T.short}
                </div>
                {isCurrentM && (
                  <div style={{
                    position: "absolute", top: 5, right: 6,
                    width: 8, height: 8, borderRadius: "50%",
                    background: T.accent,
                    boxShadow: `0 0 8px ${T.accent}`,
                  }}/>
                )}
              </div>

              {/* Mini calendar */}
              <div style={{ padding: "7px 7px 9px" }}>
                <MiniMonthGrid
                  year={year} month={m}
                  rangeStart={rangeStart} rangeEnd={rangeEnd}
                  accent={T.accent} isDark={isDark}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
