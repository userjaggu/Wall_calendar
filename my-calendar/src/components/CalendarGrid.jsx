import React from "react";
import { DAYS_GRID, MONTH_THEMES } from "../constants";
import { getWeekNumber, formatDate } from "../utils/dateUtils";

function Tooltip({ text, color, children }) {
  const [show, setShow] = React.useState(false);
  return (
    <div
      style={{ position: "relative", display: "contents" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,8,20,0.92)",
          backdropFilter: "blur(8px)",
          color: "#fff", padding: "5px 10px",
          borderRadius: 8, fontSize: 10, fontWeight: 500,
          whiteSpace: "nowrap", pointerEvents: "none",
          zIndex: 200,
          border: `1px solid ${color || "rgba(255,255,255,0.1)"}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {text}
          <div style={{
            position: "absolute", top: "100%", left: "50%",
            transform: "translateX(-50%)",
            borderTop: "5px solid rgba(8,8,20,0.92)",
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
          }}/>
        </div>
      )}
    </div>
  );
}

export default function CalendarGrid({
  month, year, cells, getDayState, onDayClick, onDayDoubleClick,
  setHoverDay, showWeekNums, highlightWeekends, setShowWeekNums, setHighlightWeekends,
  rangeStart, rangeEnd, selecting, clearRange, isDark,
}) {
  const T = MONTH_THEMES[month];
  const [hoveredCell, setHoveredCell] = React.useState(null);

  // Touch drag support for range selection
  const touchStartDay = React.useRef(null);
  const longPressTimer = React.useRef(null);

  function handleEnter(day) {
    setHoverDay(day);
    setHoveredCell(day);
  }
  function handleLeave() {
    setHoverDay(null);
    setHoveredCell(null);
  }

  // Touch handlers: touchstart = set start, touchmove = hover preview, touchend = set end
  function handleTouchStart(day, e) {
    // Start tracking the initial day
    touchStartDay.current = day;
    
    // Set a timer for long-press (500ms) to trigger Day Notes (the 'Double Click' equivalent)
    longPressTimer.current = setTimeout(() => {
      onDayDoubleClick(day); 
      // Important: clear touchStartDay so handleTouchEnd doesn't also fire a range click
      touchStartDay.current = null; 
      longPressTimer.current = null;
    }, 500);
  }

  function handleTouchMove(e) {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dayVal = el?.dataset?.day;
    const currentDay = dayVal ? parseInt(dayVal, 10) : null;

    // If movement is detected away from starting day, cancel long-press
    if (longPressTimer.current && currentDay !== touchStartDay.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (currentDay) {
      setHoverDay(currentDay);
    }
  }

  function handleTouchEnd(day, e) {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Only process tap if the long-press didn't fire (current is not null)
    if (touchStartDay.current !== null) {
      onDayClick(touchStartDay.current);
    }

    touchStartDay.current = null;
    setHoverDay(null);
  }

  const hasRange = rangeStart || rangeEnd;

  return (
    <div style={{ padding: "18px 18px 16px", flex: "1 1 0", minWidth: 0 }}>
      {/* Range selector chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Start", val: rangeStart, active: selecting === "start" },
          { label: "End",   val: rangeEnd,   active: selecting === "end"   },
        ].map(({ label, val, active }) => (
          <div key={label} style={{
            flex: 1, minWidth: 110, padding: "7px 12px", borderRadius: 10,
            border: `2px solid ${active ? T.accent : (isDark ? "#1e1e2e" : "#e5e9f0")}`,
            background: active
              ? (isDark ? `${T.accent}18` : `${T.accent}0c`)
              : (isDark ? "#111120" : "#f7f9fc"),
            transition: "all 0.25s",
            position: "relative", overflow: "hidden",
          }}>
            {active && (
              <div style={{
                position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
                background: `linear-gradient(to bottom, ${T.accent}, ${T.glow})`,
              }}/>
            )}
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
              color: active ? T.accent : (isDark ? "#3a3a5e" : "#c8d0dc"),
              textTransform: "uppercase", marginBottom: 2,
            }}>{label} Date</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? "#d0d0e0" : "#2d3748" }}>
              {val ? formatDate(val, "full") : (
                <span style={{ color: isDark ? "#2a2a3a" : "#d8dde8", fontStyle: "italic", fontWeight: 400 }}>
                  {active ? "Tap a date…" : "—"}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Clear button — always visible when a range exists */}
        {hasRange && (
          <button
            onClick={clearRange}
            style={{
              padding: "0 14px", height: 44, borderRadius: 10,
              border: `1.5px solid ${isDark ? "#2a2a3a" : "#e5e9f0"}`,
              background: isDark ? "#111120" : "#f7f9fc",
              color: isDark ? "#666" : "#aaa",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5,
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = isDark ? "#2a2a3a" : "#e5e9f0";
              e.currentTarget.style.color = isDark ? "#666" : "#aaa";
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Option toggles */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { label: "Week #",    val: showWeekNums,      set: setShowWeekNums      },
          { label: "Weekends",  val: highlightWeekends, set: setHighlightWeekends },
        ].map(({ label, val, set }) => (
          <button key={label} onClick={() => set(v => !v)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 9, fontWeight: 700,
            letterSpacing: 0.5, textTransform: "uppercase",
            border: `1px solid ${val ? T.accent : (isDark ? "#1e1e2e" : "#e0e5ea")}`,
            background: val ? (isDark ? `${T.accent}22` : `${T.accent}10`) : "transparent",
            color: val ? T.accent : (isDark ? "#3a3a5a" : "#c0c8d4"),
            cursor: "pointer", transition: "all 0.2s",
            minHeight: 32, // accessible touch target
          }}>
            {val ? "✓ " : ""}{label}
          </button>
        ))}
      </div>

      {/* Day headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: showWeekNums ? "22px repeat(7,1fr)" : "repeat(7,1fr)",
        gap: 3, marginBottom: 4,
      }}>
        {showWeekNums && <div/>}
        {DAYS_GRID.map((d, i) => (
          <div key={d} style={{
            textAlign: "center", fontSize: 9, fontWeight: 800,
            letterSpacing: 1, padding: "3px 0",
            color: (i >= 5 && highlightWeekends)
              ? T.accent
              : (isDark ? "#2a2a4a" : "#c0c8d4"),
            textTransform: "uppercase",
          }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showWeekNums ? "22px repeat(7,1fr)" : "repeat(7,1fr)",
          gap: 3,
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { setHoverDay(null); }}
      >
        {cells.map((day, idx) => {
          const colIdx     = idx % 7;
          const isRowStart = showWeekNums && colIdx === 0;
          const weekNum    = isRowStart && day
            ? getWeekNumber(new Date(year, month, day)) : null;

          const weekNumEl = showWeekNums ? (
            <div key={`wn-${idx}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8, color: isDark ? "#1e1e32" : "#dde3ea", fontWeight: 700,
            }}>
              {weekNum || ""}
            </div>
          ) : null;

          if (!day) return (
            <React.Fragment key={`e-${idx}`}>
              {weekNumEl}
              <div/>
            </React.Fragment>
          );

          const st = getDayState(day, colIdx);
          const {
            isToday, isStart, isEnd, isInRange, isInPreview, isPreviewEnd,
            isWeekend, holiday, hasNote, isPulsing, isActiveDay,
          } = st;
          const isActive = isStart || isEnd || isActiveDay;
          const isHov    = hoveredCell === day && !isActive;

          let bgCell = "transparent";
          if (isActive)     bgCell = `linear-gradient(135deg, ${T.accent}, ${T.glow})`;
          else if (isInRange)   bgCell = `${T.accent}22`;
          else if (isInPreview) bgCell = `${T.accent}12`;

          // preview end gets a dashed outline to distinguish from confirmed "end"
          const previewEndOutline = isPreviewEnd && !isActive
            ? `2px dashed ${T.accent}99`
            : "none";

          const borderRadius = isStart ? "12px 3px 3px 12px"
            : isEnd   ? "3px 12px 12px 3px"
            : (isInRange || isInPreview) ? "2px" : "10px";

          return (
            <React.Fragment key={day}>
              {weekNumEl}
              <Tooltip
                text={
                  holiday  ? `${holiday.emoji} ${holiday.name}`
                  : isToday ? "Today"
                  : null
                }
                color={holiday?.color || T.accent}
              >
                <div
                  data-day={day}
                  onClick={(e) => {
                    // detail === 0 is emulated click. detail === 1 is real click.
                    // detail === 2 is double-click (though onDoubleClick handles that)
                    if (e.detail === 0) return; 
                    if (e.detail === 2) {
                      onDayDoubleClick(day);
                      return;
                    }
                    onDayClick(day);
                  }}
                  onMouseEnter={() => handleEnter(day)}
                  onMouseLeave={handleLeave}
                  // Double clicking the same button will fire twice
                  onDoubleClick={(e) => {
                    if (e.detail === 0) return;
                    // Note: double click logic is also in onClick for better detection
                  }}
                  onTouchStart={(e) => handleTouchStart(day, e)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleTouchEnd(day, e);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${day} ${MONTH_THEMES[month].name} ${year}${isToday ? ", Today" : ""}${holiday ? `, ${holiday.name}` : ""}`}
                  onKeyDown={e => e.key === "Enter" && onDayClick(day)}
                  style={{
                    aspectRatio: "1",
                    minWidth: 0,        // prevent overflow at 320px
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    borderRadius,
                    background: bgCell,
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.14s ease",
                    outline: isActive ? `2px solid #fff` : (isToday ? `2px solid ${T.accent}` : previewEndOutline),
                    outlineOffset: -2,
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    // min touch size 44px handled by aspect-ratio + gap, fine on ≥360px
                    transform: isPulsing ? "scale(1.25)" : isHov ? "scale(1.1) translateZ(4px)" : "scale(1)",
                    boxShadow: isActive ? `0 4px 18px ${T.accent}55` : isHov ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                    zIndex: isHov || isPulsing ? 2 : 1,
                  }}
                >
                  <span style={{
                    fontSize: "clamp(10px, 1.6vw, 13px)",
                    fontWeight: isActive || isToday ? 800 : 500,
                    color: isActive  ? "#fff"
                      : isWeekend  ? T.accent
                      : (isDark    ? "#b0b0cc" : "#2d3748"),
                    lineHeight: 1,
                  }}>
                    {day}
                  </span>

                  {/* Indicator dots */}
                  <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {holiday && (
                      <div style={{ fontSize: 7, lineHeight: 1 }}>
                        {holiday.emoji}
                      </div>
                    )}
                    {hasNote && (
                      <div style={{
                        width: 3, height: 3, borderRadius: "50%",
                        background: isActive ? "rgba(255,255,255,0.8)" : T.accent,
                        flexShrink: 0,
                      }}/>
                    )}
                  </div>
                </div>
              </Tooltip>
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { style: { background: `linear-gradient(135deg,${T.accent},${T.glow})` }, label: "Selected" },
          { style: { background: `${T.accent}35` },                                  label: "In Range" },
          { style: { border: `2px solid ${T.accent}`, background: "transparent" },   label: "Today"    },
          { style: { background: T.accent, borderRadius: "50%" },                    label: "Note"     },
        ].map(({ style, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 9, height: 9, borderRadius: 3, flexShrink: 0, ...style }}/>
            <span style={{ fontSize: 9, color: isDark ? "#333" : "#c0c8d4", fontWeight: 600, letterSpacing: 0.3 }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
