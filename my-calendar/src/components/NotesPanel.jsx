import React, { useRef, useEffect } from "react";
import { MONTH_THEMES, NOTE_TAGS } from "../constants";
import { formatDate } from "../utils/dateUtils";

export default function NotesPanel({
  month, year, noteMode, setNoteMode, activeDay,
  rangeStart, rangeEnd, noteText, onNoteChange,
  notesList, onDeleteNote, noteTag, setNoteTag, isDark,
  setPendingKey, noteKey, onNoteClick, saveNote,
}) {
  const T = MONTH_THEMES[month];
  const textareaRef  = useRef(null);
  const isNoteActive = noteMode === "range"
    ? (rangeStart && rangeEnd)
    : !!activeDay;

  const handleAddReminder = () => {
    if (!noteText.trim()) return;
    const baseKey = noteKey();
    const newUniqueKey = `${baseKey}__r${Date.now()}`;
    
    // Save current
    onNoteChange(noteText); 
    
    // Prepare for next
    setPendingKey(newUniqueKey);
    onNoteChange(""); 
    
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleSubmit = () => {
    if (!noteText.trim()) return;
    
    // 1. Force a save with the current text first
    saveNote(noteText);
    
    // 2. Then clear the textarea UI
    // Note: We don't call saveNote("") because that would overwrite 
    // the note with an empty string. We just manually clear the prop 
    // or rely on the parent state.
    onNoteChange("");
    
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Auto-focus when context becomes active
  useEffect(() => {
    if (isNoteActive && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [noteMode, activeDay, rangeStart, rangeEnd]);

  const contextLabel = noteMode === "range"
    ? (rangeStart && rangeEnd
        ? `${formatDate(rangeStart, "short")} → ${formatDate(rangeEnd, "short")}`
        : "Select a date range first")
    : (activeDay
        ? `${activeDay} ${MONTH_THEMES[month].name} ${year}`
        : "Double-tap a day");

  return (
    <div
      className="notes-panel"
      style={{
        flex: "0 1 275px",
        minWidth: 195,
        display: "flex",
        flexDirection: "column",
        borderLeft: `1px solid ${isDark ? "#14141f" : "#eef1f6"}`,
        background: isDark
          ? "linear-gradient(180deg, #0a0a16 0%, #0c0c18 100%)"
          : "linear-gradient(180deg, #f9fafd 0%, #f4f6fb 100%)",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "14px 16px 10px",
        borderBottom: `1px solid ${isDark ? "#14141f" : "#eef1f6"}`,
      }}>
        {/* Title + tag row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 10,
        }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: 2,
            color: isDark ? "#252540" : "#c8d0dc",
            textTransform: "uppercase",
          }}>
            ✦ Notes
          </span>

          {/* Tag buttons — enlarged touch target */}
          <div style={{ display: "flex", gap: 4 }}>
            {Object.entries(NOTE_TAGS).map(([key, tag]) => (
              <button
                key={key}
                onClick={() => setNoteTag(key)}
                title={tag.label}
                aria-label={tag.label}
                style={{
                  // 32px visual + padding for 44px touch target
                  width: 32, height: 32, borderRadius: 9,
                  border: `1.5px solid ${noteTag === key ? tag.color : (isDark ? "#1e1e2e" : "#e5eaf2")}`,
                  background: noteTag === key
                    ? (isDark ? `${tag.color}28` : `${tag.color}15`)
                    : "transparent",
                  cursor: "pointer", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                  transform: noteTag === key ? "scale(1.1)" : "scale(1)",
                }}
              >
                {tag.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: "flex", gap: 0,
          background: isDark ? "#0e0e1a" : "#eef1f6",
          borderRadius: 9, padding: 3,
        }}>
          {[
            { key: "range", icon: "📅", label: "Range" },
            { key: "day",   icon: "📌", label: "Day"   },
          ].map(({ key, icon, label }) => (
            <button key={key} onClick={() => setNoteMode(key)} style={{
              flex: 1, padding: "6px 0",   // taller for touch
              borderRadius: 7, border: "none",
              background: noteMode === key
                ? (isDark ? `${T.accent}28` : T.accent)
                : "transparent",
              color: noteMode === key
                ? (isDark ? T.accent : "#fff")
                : (isDark ? "#2a2a44" : "#aab4c4"),
              fontSize: 10, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      {/* Context chip */}
      <div style={{ padding: "8px 16px 4px" }}>
        <div style={{
          fontSize: 10, fontWeight: 600,
          color: isNoteActive ? T.accent : (isDark ? "#1e1e2e" : "#dde3ea"),
          display: "flex", alignItems: "center", gap: 5,
          transition: "color 0.3s",
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: isNoteActive ? T.accent : (isDark ? "#1e1e2e" : "#dde3ea"),
            display: "inline-block",
            boxShadow: isNoteActive ? `0 0 6px ${T.accent}` : "none",
            transition: "all 0.3s",
          }}/>
          {contextLabel}
        </div>
      </div>

      {/* Textarea */}
      <div style={{ padding: "6px 12px 8px", position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={noteText}
          onChange={e => onNoteChange(e.target.value)}
          disabled={!isNoteActive}
          placeholder={isNoteActive ? "Write your note here…" : "Select dates or double-tap a day…"}
          style={{
            width: "100%", minHeight: 110,
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${isDark ? "#1a1a28" : "#e5eaf2"}`,
            background: isDark
              ? (isNoteActive ? "#0a0a14" : "#080810")
              : (isNoteActive ? "#ffffff" : "#f0f2f8"),
            color: isDark ? "#c8c8e0" : "#2d3748",
            fontSize: 12, lineHeight: 1.65,
            resize: "vertical", outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.2s, box-shadow 0.2s, background 0.3s",
            boxSizing: "border-box",
            opacity: isNoteActive ? 1 : 0.4,
          }}
          onFocus={e => {
            e.target.style.borderColor = T.accent;
            e.target.style.boxShadow = `0 0 0 3px ${T.accent}20, 0 4px 16px rgba(0,0,0,0.15)`;
          }}
          onBlur={e => {
            e.target.style.borderColor = isDark ? "#1a1a28" : "#e5eaf2";
            e.target.style.boxShadow = "none";
          }}
        />
        {/* Tag chip overlay */}
        {isNoteActive && (
          <div style={{
            position: "absolute", bottom: 16, right: 20,
            fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
            color: NOTE_TAGS[noteTag]?.color,
            textTransform: "uppercase",
            background: `${NOTE_TAGS[noteTag]?.color}18`,
            padding: "2px 6px", borderRadius: 6,
            opacity: 0.8, pointerEvents: "none",
          }}>
            {NOTE_TAGS[noteTag]?.icon} {NOTE_TAGS[noteTag]?.label}
          </div>
        )}
      </div>

      {/* Submit button for the textarea */}
      {isNoteActive && (
        <div style={{ padding: "0 12px 10px" }}>
          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              background: T.accent,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 0",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${T.accent}33`,
              transition: "transform 0.2s, box-shadow 0.2s, opacity 0.2s",
              opacity: noteText.trim() ? 1 : 0.6,
            }}
            onMouseEnter={e => {
              if (noteText.trim()) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 6px 16px ${T.accent}44`;
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${T.accent}33`;
            }}
          >
            Submit Note
          </button>
        </div>
      )}

      {/* Chips for "THIS MONTH" below submit */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: 2,
          color: isDark ? "#252540" : "#c8d0dc",
          textTransform: "uppercase", marginBottom: 8,
          display: "flex", alignItems: "center", gap: 6
        }}>
          THIS MONTH 📌
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {notesList.map((n, i) => {
            const tag = NOTE_TAGS[n.tag];
            return (
              <div key={n.key || i} 
                onClick={() => onNoteClick(n)}
                style={{
                  padding: "4px 10px", borderRadius: 20,
                  background: isDark ? "#0e0e1a" : "#f0f4fb",
                  borderLeft: `3px solid ${tag?.color || T.accent}`,
                  fontSize: 10, display: "flex", alignItems: "center", gap: 6,
                  color: isDark ? "#b0b0cc" : "#4a5568",
                  maxWidth: "100%", overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <span>{tag?.icon}</span>
                <span style={{ 
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", 
                  maxWidth: 100 
                }}>
                  {n.text.slice(0, 40)}{n.text.length > 40 && "..."}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(n.key);
                  }}
                  style={{ 
                    background: "none", border: "none", cursor: "pointer", 
                    fontSize: 12, padding: 0, color: "inherit", opacity: 0.6 
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
