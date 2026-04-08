import React, { useRef, useEffect, useState } from "react";
import "../index.css";

import { MONTH_THEMES } from "../constants";
import { useCalendar }  from "../hooks/useCalendar";

import SpiralBinding from "./SpiralBinding";
import HeroImage     from "./HeroImage";
import StatsBar      from "./StatsBar";
import HolidayBanner from "./HolidayBanner";
import CalendarGrid  from "./CalendarGrid";
import NotesPanel    from "./NotesPanel";
import MiniYearView  from "./MiniYearView";

export default function WallCalendar() {
  const cal = useCalendar();
  const {
    today, year, setYear, month, rangeStart, rangeEnd, selecting,
    hoverDay, setHoverDay, notes, noteMode, setNoteMode, activeDay,
    theme, setTheme, view, setView, animDir, animating, imgLoaded, setImgLoaded,
    confetti, showWeekNums, setShowWeekNums, highlightWeekends, setHighlightWeekends,
    noteTag, setNoteTag, copyToast,
    cells, rangeDays, notesList, navigate, goToMonth, clearRange,
    handleDayClick, handleDayDoubleClick, copyRange,
    getNoteText, saveNote, deleteNote, getDayState,
    setPendingKey, noteKey, handleNoteClick,
  } = cal;

  const T      = MONTH_THEMES[month];
  const isDark = theme === "dark";

  // ── 3D Card Tilt (desktop only) ───────────────────────────────────────────
  const cardRef  = useRef(null);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Only apply tilt on devices that have a mouse
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;

    const handleMove = (e) => {
      const card = cardRef.current;
      if (!card) return;
      const r = card.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        setCardTilt({ x: 0, y: 0 });
        return;
      }
      const nx = (e.clientX - r.left)  / r.width  - 0.5;
      const ny = (e.clientY - r.top)   / r.height - 0.5;
      setCardTilt({ x: ny * -3, y: nx * 3 });
    };
    const handleLeave = () => setCardTilt({ x: 0, y: 0 });

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const flipTransform = animating
    ? `perspective(1300px) rotateY(${animDir * -5}deg) scaleX(0.97) rotateX(${cardTilt.x}deg)`
    : `perspective(1300px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`;

  return (
    <div style={{
      minHeight: "100vh",
      padding: "clamp(0px, 2vw, 36px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
      background: isDark
        ? `radial-gradient(ellipse at 15% 50%, ${T.glow}18 0%, transparent 55%),
           radial-gradient(ellipse at 85% 20%, ${T.accent}12 0%, transparent 50%),
           radial-gradient(ellipse at 50% 90%, ${T.glow}0a 0%, transparent 50%),
           linear-gradient(160deg, #06060f 0%, #0a0a18 50%, #070710 100%)`
        : `radial-gradient(ellipse at 15% 50%, ${T.glow}10 0%, transparent 55%),
           radial-gradient(ellipse at 85% 20%, ${T.accent}0c 0%, transparent 50%),
           linear-gradient(160deg, #eef1f8 0%, #e4e8f3 50%, #dde3ef 100%)`,
      transition: "background 0.9s ease",
      fontFamily: "'Outfit', system-ui, sans-serif",
      "--accent": T.accent,
    }}>

      {/* Ambient orbs */}
      {[
        { w: 480, h: 480, top: "8%",   left: "2%",   dur: 8,  color: T.glow,   op: isDark ? 0.09 : 0.06 },
        { w: 340, h: 340, top: "55%",  right: "3%",  dur: 11, color: T.accent, op: isDark ? 0.07 : 0.05 },
        { w: 220, h: 220, bottom:"10%",left: "42%",  dur: 7,  color: T.accent, op: isDark ? 0.05 : 0.03 },
      ].map((o, i) => (
        <div key={i} style={{
          position: "fixed",
          width: o.w, height: o.h,
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          borderRadius: "50%",
          background: o.color,
          filter: "blur(90px)",
          opacity: o.op,
          animation: `${i % 2 === 0 ? "floatOrb" : "floatOrb2"} ${o.dur}s ease-in-out infinite`,
          pointerEvents: "none",
          zIndex: 0,
          transition: "background 0.9s ease, opacity 0.9s ease",
        }}/>
      ))}

      {/* Confetti */}
      {confetti.map(p => (
        <div key={p.id} style={{
          position: "fixed",
          left: `${p.x}%`, top: "-12px",
          width: p.size, height: p.size,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          background: p.color,
          zIndex: 999, pointerEvents: "none",
          "--spin": p.spin,
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}

      {/* Copy toast */}
      {copyToast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: isDark ? "#1c1c2e" : "#fff",
          border: `1px solid ${T.accent}55`,
          borderRadius: 12, padding: "10px 20px",
          color: T.accent, fontSize: 13, fontWeight: 700,
          zIndex: 1000, boxShadow: `0 8px 32px rgba(0,0,0,0.25)`,
          animation: "slideIn 0.25s ease forwards",
          pointerEvents: "none",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>✓</span> Range copied to clipboard!
        </div>
      )}

      {/* ═══════════════ CALENDAR CARD ═══════════════ */}
      <div
        ref={cardRef}
        className="calendar-card"
        style={{
          width: "100%", maxWidth: 1040,
          borderRadius: window.innerWidth <= 600 ? 0 : 28,
          minHeight: window.innerWidth <= 600 ? "100vh" : "auto",
          overflowY: window.innerWidth <= 600 ? "visible" : "hidden",
          overflowX: "hidden",
          background: isDark
            ? "linear-gradient(160deg, #0e0e1c 0%, #0c0c18 100%)"
            : "#ffffff",
          boxShadow: isDark
            ? `0 50px 120px rgba(0,0,0,0.75),
               0 0 0 1px ${T.accent}20,
               inset 0 1px 0 ${T.accent}18,
               inset 0 -1px 0 rgba(0,0,0,0.4)`
            : `0 40px 100px rgba(0,0,0,0.12),
               0 8px 32px rgba(0,0,0,0.06),
               0 0 0 1px ${T.accent}18,
               inset 0 1px 0 rgba(255,255,255,0.8)`,
          transform: flipTransform,
          transition: animating
            ? "transform 0.42s cubic-bezier(0.4,0,0.2,1), box-shadow 0.6s ease"
            : "transform 0.10s ease-out, box-shadow 0.6s ease",
          transformStyle: "preserve-3d",
          position: "relative", zIndex: 1,
        }}
      >

        {/* Top-right controls */}
        <div style={{
          position: "absolute", top: 38, right: 16, zIndex: 30,
          display: "flex", gap: 7, alignItems: "center",
        }}>
          <button
            onClick={() => setView(v => v === "month" ? "year" : "month")}
            className="ctrl-btn"
            style={ctrlStyle(isDark)}
          >
            {view === "month" ? "📅 Year" : "📆 Month"}
          </button>
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className="ctrl-btn"
            style={ctrlStyle(isDark)}
          >
            {isDark ? "☀ Light" : "◑ Dark"}
          </button>
        </div>

        <SpiralBinding isDark={isDark} />

        {/* ══ MONTH VIEW ══ */}
        {view === "month" && (
          <>
            <HeroImage
              month={month} year={year}
              onNavigate={navigate}
              imgLoaded={imgLoaded} setImgLoaded={setImgLoaded}
              animDir={animDir} animating={animating}
              isDark={isDark}
            />

            <HolidayBanner month={month} year={year} isDark={isDark} />

            <StatsBar
              month={month} rangeStart={rangeStart} rangeEnd={rangeEnd}
              selecting={selecting} rangeDays={rangeDays} notesList={notesList}
              isDark={isDark} onCopyRange={copyRange}
            />

            <div className="calendar-body" style={{ 
              display: "flex", 
              flexWrap: "nowrap", 
              minHeight: 380,
              flexDirection: window.innerWidth > 850 ? "row" : "column"
            }}>
              <CalendarGrid
                month={month} year={year} cells={cells}
                getDayState={getDayState}
                onDayClick={handleDayClick}
                onDayDoubleClick={handleDayDoubleClick}
                setHoverDay={setHoverDay}
                showWeekNums={showWeekNums} setShowWeekNums={setShowWeekNums}
                highlightWeekends={highlightWeekends} setHighlightWeekends={setHighlightWeekends}
                rangeStart={rangeStart} rangeEnd={rangeEnd} selecting={selecting}
                clearRange={clearRange}
                isDark={isDark}
              />

              <NotesPanel
                month={month} year={year}
                noteMode={noteMode} setNoteMode={setNoteMode}
                activeDay={activeDay} rangeStart={rangeStart} rangeEnd={rangeEnd}
                noteText={getNoteText()}
                onNoteChange={saveNote}
                notesList={notesList}
                onDeleteNote={deleteNote}
                noteTag={noteTag} setNoteTag={setNoteTag}
                isDark={isDark}
                className="notes-panel"
                setPendingKey={setPendingKey}
                noteKey={noteKey}
                onNoteClick={handleNoteClick}
                saveNote={saveNote}
              />
            </div>

            {/* Footer */}
            <div style={{
              padding: "12px 22px",
              borderTop: `1px solid ${isDark ? "#12121e" : "#eef1f6"}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: 10,
              background: isDark ? "#0e0e1c" : "#fff",
              minHeight: "44px",
              position: "relative",
              bottom: 0,
              zIndex: 50,
            }}>
              <span style={{
                fontSize: 9,
                color: isDark ? "#444466" : "#a0acbc",
                fontWeight: 600, letterSpacing: 0.5,
                flex: "1 1 200px",
              }}>
                ← → keys • Click = range • Dbl-click = day note • ESC = clear
              </span>
              <div style={{ 
                display: "flex", alignItems: "center", gap: 8,
                justifyContent: window.innerWidth <= 600 ? "flex-start" : "flex-end",
                flex: window.innerWidth <= 600 ? "1 1 100%" : "0 1 auto"
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${T.accent}, ${T.glow})`,
                  boxShadow: `0 0 8px ${T.glow}80`,
                }}/>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
                  color: isDark ? "#444466" : "#a0acbc",
                }}>
                  {T.name.toUpperCase()} · {T.mood.toUpperCase()}
                </span>
              </div>
            </div>
          </>
        )}

        {/* ══ YEAR VIEW ══ */}
        {view === "year" && (
          <MiniYearView
            year={year} setYear={setYear}
            currentMonth={month}
            goToMonth={goToMonth}
            rangeStart={rangeStart} rangeEnd={rangeEnd}
            isDark={isDark}
            onBack={() => setView("month")}
          />
        )}
      </div>
    </div>
  );
}

function ctrlStyle(isDark) {
  return {
    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
    borderRadius: 20, padding: "5px 12px",
    color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
    fontSize: 10, fontWeight: 700, cursor: "pointer",
    backdropFilter: "blur(8px)", letterSpacing: 0.5,
    textTransform: "uppercase", transition: "all 0.2s",
    fontFamily: "inherit",
    // Ensure 44px touch target area
    minHeight: 32, minWidth: 60,
  };
}
