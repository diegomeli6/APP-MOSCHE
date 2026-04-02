# Fly Counter App — CLAUDE.md

## Project Overview

A fun, playful web app to track how many flies land in your friends' ears.
Each friend has a personal fly counter you can increment or decrement.
Data persists in `localStorage` so it survives page refreshes.
The app must be fully responsive (mobile, tablet, desktop).

## Tech Stack

- **Pure HTML + CSS + JavaScript** — no build tools, no frameworks, no npm
- Single `index.html` file (or split into `index.html`, `style.css`, `app.js`)
- Hosted on **GitHub Pages** (free, static hosting)

## Features

### Core
- Add a friend by name
- Remove a friend
- Increment fly count for a friend (big tap-friendly `+` button)
- Decrement fly count for a friend (no negative counts)
- Show current fly count prominently per friend
- Persist all data in `localStorage` under key `fly-counter-friends`
- Load saved data on page load

### UI / UX
- Fun & playful style: bright colors, fly emoji (🪰), casual vibe
- Large tap targets — works well on phone touchscreens
- Responsive layout: single column on mobile, grid on tablet/desktop
- Clear visual feedback on button press (scale/color animation)
- "Reset" button per friend to zero out their count (with confirmation)
- "Clear all" button to wipe all data (with confirmation dialog)

## File Structure

```
/
├── index.html      # App shell + markup
├── style.css       # All styles (CSS variables for theming)
├── app.js          # All logic (no external dependencies)
└── CLAUDE.md       # This file
```

## Design Guidelines

- Primary color: a warm yellow or amber (`#FFCA28` or similar)
- Accent: playful orange or coral
- Font: system UI stack or a free Google Font (e.g. Nunito or Poppins)
- Friend cards: rounded corners, slight shadow, fly emoji as decoration
- Counter number: large, bold, centered on the card
- Mobile-first CSS, use CSS Grid or Flexbox for the card layout

## Data Model (localStorage)

```json
[
  { "id": "uuid-or-timestamp", "name": "Marco", "count": 3 },
  { "id": "uuid-or-timestamp", "name": "Sara",  "count": 7 }
]
```

## Deployment

1. Create a GitHub repository named `fly-counter` (public)
2. Push all files to the `main` branch
3. Enable GitHub Pages: Settings → Pages → Source: `main` branch, `/ (root)`
4. The app will be live at `https://<your-username>.github.io/fly-counter`

## Out of Scope (for this prototype)

- User authentication
- Backend / database
- Real-time sync between devices
- Native mobile app
