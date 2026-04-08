# Wall Calendar — Interactive React Component

A polished, feature-rich wall calendar component built with **React + Vite**, inspired by the physical wall calendar aesthetic. Created as a frontend internship assessment for Take U Forward.

---

## Features

### Core
- **Wall Calendar Aesthetic** — Spiral binding, monthly hero photography, wave SVG edge, serif typography
- **Day Range Selector** — Click start → click end; live hover preview shows tentative range; dashed outline distinguishes pending end from confirmed end
- **Integrated Notes** — Range notes (attached to a date range) and Day notes (double-click any day); persistent via `localStorage`
- **Fully Responsive** — Stacks vertically on mobile; side-by-side panels on desktop; touch-friendly 44px minimum tap targets

### Creative Extras
- **12 unique month themes** — Each month has its own accent color, glow, and Unsplash hero image; the entire UI recolors per month
- **3D parallax hero** — Mouse-move tilt on desktop; swipe left/right to navigate months on mobile
- **3D card tilt** — The calendar card subtly tilts with the cursor (desktop only; safely disabled on touch devices)
- **Year overview** — Click "Year" to see all 12 months as a mini grid; click any month to jump to it; back button included
- **Holiday markers** — 23 Indian + global holidays with dots and a scrollable "This Month" banner
- **Stats bar** — Live display of start/end/duration/note count; one-click copy range to clipboard
- **Confetti** — Bursts when you complete a date range selection
- **Note tags** — Personal, Work, Travel, Reminder
- **Week number toggle** — Optional column on the left of the grid
- **Weekend highlight toggle** — Toggle accent color on Sat/Sun
- **Keyboard navigation** — Left/Right arrow keys flip months; Escape clears range; arrow keys are blocked inside the textarea so they don't accidentally navigate
- **Monthly quotes** — Inspirational quote strip at the bottom of each hero image
- **localStorage persistence** — Notes and theme preference survive page refresh
- **Dark / Light theme** — Persisted in localStorage; defaults to dark

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install & Run

```bash
# Clone or unzip the project
cd my-calendar

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## My Journey & Methodology

### 1. Minimal Prototype to Polished Product
I started this project with a **minimalist approach**, focusing purely on functional **date selection math**. The core `dateUtils.js` and `useCalendar.js` were built first to ensure that range selection felt solid on a basic grid before adding any "bells and whistles."

### 2. Evolution of Features
As the selection logic became stable, I transitioned into the **aesthetic and interactive phase**:
- **Wall Calendar Vibe**: Introduced the spiral binding, 12 unique month themes, and the immersive parallax hero images.
- **Enhanced UX**: Added features like "Week Number" toggles, holiday markers, and Indian/Global holiday data for context.
- **Robust Persistence**: Implemented `localStorage` early so that a user’s progress (notes, range, and theme) would survive a page refresh without needing a full-blown backend.

### 3. Solving the Mobile Gap
The hardest part of the evolution was translating desktop-specific gestures (like double-clicking to add a note) to mobile. I solved this by implementing a **Long-Press (500ms)** detector in the calendar grid. This allows mobile users to access "Day Notes" intuitively without adding extra clutter to the UI.

---

## Technical Decisions

| Decision | Rationale |
|---|---|
| **Vite over CRA** | Rapid development and optimized bundling for better performance. |
| **Long-Press for Mobile** | Bridged the accessibility gap for "Day Notes" without needing a double-click on touch screens. |
| **Custom hook useCalendar** | Keeps all calendar state (notes, range, theme) in one source of truth. |
| **localStorage for data** | Provides persistence for notes/themes since no server was required for the assessment. |
| **CSS Variables (--accent)** | Allows the entire UI to "re-theme" itself dynamically based on the current month's accent color. |

---

## Project Structure

```
src/
├── components/
│   ├── WallCalendar.jsx     # Root layout, card tilt, confetti, theme toggle
│   ├── CalendarGrid.jsx     # Day cells, range chips, clear button, touch drag
│   ├── HeroImage.jsx        # Parallax photo, month/year title, swipe navigation
│   ├── HolidayBanner.jsx    # Scrollable holiday chips
│   ├── MiniYearView.jsx     # 12-month overview with back button
│   ├── NotesPanel.jsx       # Textarea, tag selector, saved notes list
│   ├── SpiralBinding.jsx    # Decorative spiral rings at top
│   └── StatsBar.jsx         # Range stats + copy-to-clipboard button
├── hooks/
│   └── useCalendar.js       # All state, localStorage, keyboard nav, confetti
├── utils/
│   └── dateUtils.js         # Pure date helpers (getDaysInMonth, sameDay, …)
├── constants/
│   └── index.js             # MONTH_THEMES, HOLIDAYS, QUOTES, NOTE_TAGS
├── index.css                # Global styles, animations, responsive breakpoints
└── main.jsx
```

---


