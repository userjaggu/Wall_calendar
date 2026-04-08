import { useState, useEffect, useCallback, useRef } from "react";
import { sameDay, inRange, daysBetween, buildCalendarCells, getHolidayKey } from "../utils/dateUtils";
import { HOLIDAYS, MONTH_THEMES } from "../constants";

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadNotes() {
  try { return JSON.parse(localStorage.getItem("cal-notes") || "{}"); }
  catch { return {}; }
}
function loadTheme() {
  try { return localStorage.getItem("cal-theme") || "dark"; }
  catch { return "dark"; }
}

export function useCalendar() {
  const today = new Date();

  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd,   setRangeEnd]   = useState(null);
  const [selecting,  setSelecting]  = useState("start");
  const [hoverDay,   setHoverDay]   = useState(null);

  // Persisted state
  const [notes, setNotes] = useState(loadNotes);
  const [theme, setTheme] = useState(loadTheme);

  const [noteMode,  setNoteMode]  = useState("range");
  const [activeDay, setActiveDay] = useState(null);
  const [view,      setView]      = useState("month");
  const [animDir,   setAnimDir]   = useState(0);
  const [animating, setAnimating] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [confetti,  setConfetti]  = useState([]);
  const [pulseDay,  setPulseDay]  = useState(null);
  const [showWeekNums,      setShowWeekNums]      = useState(false);
  const [highlightWeekends, setHighlightWeekends] = useState(true);
  const [noteTag, setNoteTag]   = useState("personal");
  const [copyToast, setCopyToast] = useState(false);
  const [pendingKey, setPendingKey] = useState(null);

  // Persist notes
  useEffect(() => {
    try { localStorage.setItem("cal-notes", JSON.stringify(notes)); }
    catch { /* storage full */ }
  }, [notes]);

  // Persist theme
  useEffect(() => {
    try { localStorage.setItem("cal-theme", theme); }
    catch { /* ignore */ }
  }, [theme]);

  // Sync CSS --accent on :root so scrollbars & global styles pick it up
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", MONTH_THEMES[month].accent);
  }, [month]);

  // Preload adjacent month images
  useEffect(() => {
    [-1, 1].forEach(offset => {
      let m = month + offset;
      if (m < 0)  m = 11;
      if (m > 11) m = 0;
      const img = new Image();
      img.src = MONTH_THEMES[m].img;
    });
  }, [month]);

  // Stable refs to avoid stale-closure in keyboard handler
  const navigateRef   = useRef(null);
  const clearRangeRef = useRef(null);

  const navigate = useCallback((dir) => {
    if (animating) return;
    setAnimDir(dir);
    setAnimating(true);
    setImgLoaded(false);
    setTimeout(() => {
      setMonth(prev => {
        let m = prev + dir;
        if (m > 11) { setYear(y => y + 1); m = 0; }
        if (m < 0)  { setYear(y => y - 1); m = 11; }
        return m;
      });
      setAnimating(false);
    }, 420);
  }, [animating]);

  navigateRef.current = navigate;

  function goToMonth(m, y) {
    setMonth(m);
    if (y !== undefined) setYear(y);
    setView("month");
  }

  const clearRange = useCallback(() => {
    setRangeStart(null);
    setRangeEnd(null);
    setSelecting("start");
  }, []);

  clearRangeRef.current = clearRange;

  // Keyboard navigation — uses refs so never stale
  useEffect(() => {
    const handler = (e) => {
      // Never steal arrow keys from textarea/input
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if (e.key === "ArrowLeft")  navigateRef.current(-1);
      if (e.key === "ArrowRight") navigateRef.current(1);
      if (e.key === "Escape")     clearRangeRef.current();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // intentionally [] — refs handle freshness

  function spawnConfetti() {
    const T = MONTH_THEMES[month];
    const pieces = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 1.4 + Math.random() * 0.8,
      color: [T.accent, T.glow, "#ffffff", "#ffd700", "#ff6b6b"][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 7,
      spin: Math.random() > 0.5 ? 1 : -1,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2800);
  }

  function handleDayClick(day) {
    const d = new Date(year, month, day);
    setPulseDay(day);
    setTimeout(() => setPulseDay(null), 600);

    if (selecting === "start") {
      setRangeStart(d);
      setRangeEnd(null);
      setSelecting("end");
    } else {
      const start = d < rangeStart ? d : rangeStart;
      const end   = d < rangeStart ? rangeStart : d;
      setRangeStart(start);
      setRangeEnd(end);
      setSelecting("start");
      setNoteMode("range");
      spawnConfetti();
    }
    setActiveDay(day);
  }

  function handleDayDoubleClick(day) {
    setNoteMode("day");
    setActiveDay(day);
  }

  // Copy range to clipboard
  function copyRange() {
    if (!rangeStart || !rangeEnd) return;
    const days = daysBetween(rangeStart, rangeEnd);
    const fmt  = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const text = `${fmt(rangeStart)} → ${fmt(rangeEnd)} (${days} day${days !== 1 ? "s" : ""})`;

    const doToast = () => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(doToast).catch(() => fallbackCopy(text, doToast));
    } else {
      fallbackCopy(text, doToast);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); cb(); } catch { /* ignore */ }
    document.body.removeChild(ta);
  }

  // Notes helpers
  function noteKey() {
    if (noteMode === "range" && rangeStart && rangeEnd)
      return `range__${rangeStart.toDateString()}__${rangeEnd.toDateString()}`;
    if (noteMode === "day" && activeDay)
      return `day__${year}__${month}__${activeDay}`;
    return null;
  }

  function getNoteText() {
    if (pendingKey && notes[pendingKey]) return notes[pendingKey].text || "";
    const k = noteKey();
    // Only return text if the note exists and belongs to the current month/year
    const note = k ? notes[k] : null;
    if (note && note.month === month && note.year === year) {
      return note.text || "";
    }
    return "";
  }

  function saveNote(text) {
    const k = pendingKey || noteKey();
    if (!k) return;
    
    // If text is empty, we don't want to delete the note completely 
    // unless that's intended, but here the user wants to clear the 
    // textarea without losing the note from the monthly list.
    // So we only update if there's actual text.
    if (!text.trim()) return;

    setNotes(prev => ({
      ...prev,
      [k]: { text, tag: noteTag, ts: Date.now(), key: k, month, year },
    }));
    if (pendingKey) setPendingKey(null);
  }

  function deleteNote(k) {
    setNotes(prev => { const n = { ...prev }; delete n[k]; return n; });
  }

  function handleNoteClick(n) {
    // If it's a range note, restore range
    if (n.key.startsWith("range__")) {
      const parts = n.key.split("__");
      setRangeStart(new Date(parts[1]));
      setRangeEnd(new Date(parts[2]));
      setNoteMode("range");
    } else if (n.key.startsWith("day__")) {
      // day__year__month__day
      const parts = n.key.split("__");
      setRangeStart(null);
      setRangeEnd(null);
      setNoteMode("day");
      setActiveDay(parseInt(parts[3], 10));
    }
  }

  // Derived
  const cells     = buildCalendarCells(year, month);
  const rangeDays = daysBetween(rangeStart, rangeEnd);
  const notesList = Object.values(notes)
    .filter(n => n.text?.trim() && n.month === month && n.year === year && !n.isHoliday)
    .sort((a, b) => b.ts - a.ts);
  const previewEnd = selecting === "end" && hoverDay
    ? new Date(year, month, hoverDay)
    : null;

  function getDayState(day, colIdx) {
    const d = new Date(year, month, day);
    const isToday     = sameDay(d, today);
    const isStart     = sameDay(d, rangeStart);
    const isEnd       = sameDay(d, rangeEnd);
    const isInRange   = inRange(d, rangeStart, rangeEnd);
    // previewEnd is the "tentative end" cell — show it distinctly, not as full "in range"
    const isPreviewEnd = !!previewEnd && sameDay(d, previewEnd);
    const isInPreview  = !!previewEnd && inRange(d, rangeStart, previewEnd);
    const isWeekend   = highlightWeekends && (colIdx === 5 || colIdx === 6);
    const holiday     = HOLIDAYS[getHolidayKey(month, day)];
    const hasNote     = !!notes[`day__${year}__${month}__${day}`]?.text;
    const isHovered   = hoverDay === day;
    const isPulsing   = pulseDay === day;
    const isActiveDay = noteMode === "day" && activeDay === day;
    return {
      isToday, isStart, isEnd, isInRange, isInPreview, isPreviewEnd,
      isWeekend, holiday, hasNote, isHovered, isPulsing, isActiveDay,
    };
  }

  return {
    today, year, setYear, month, rangeStart, rangeEnd, selecting, hoverDay, setHoverDay,
    notes, noteMode, setNoteMode, activeDay, theme, setTheme,
    view, setView, animDir, animating, imgLoaded, setImgLoaded, confetti,
    showWeekNums, setShowWeekNums, highlightWeekends, setHighlightWeekends,
    noteTag, setNoteTag, copyToast,
    cells, rangeDays, notesList, previewEnd,
    navigate, goToMonth, clearRange, handleDayClick, handleDayDoubleClick,
    copyRange, noteKey, getNoteText, saveNote, deleteNote, getDayState,
    setPendingKey, handleNoteClick,
  };
}
