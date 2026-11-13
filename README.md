# StudyAesthetic

A relaxing, minimal study workspace: pomodoro timer, ambient sound mixer, task list,
notes, breathing guide, study statistics and a library of aesthetic video spaces and
backgrounds — all as draggable floating widgets over an ambient YouTube background.

Built with [Astro](https://astro.build), [Tailwind CSS v4](https://tailwindcss.com) and
TypeScript. No backend required: user data lives in `localStorage` and is designed to be
swappable for Supabase (see `src/lib/supabase.ts` and `supabase-schema.sql`).

## 🚀 Getting started

```sh
npm install
npm run dev       # dev server at http://localhost:4321
```

## 🧞 Commands

| Command           | Action                                                        |
| :---------------- | :------------------------------------------------------------ |
| `npm install`     | Installs dependencies                                          |
| `npm run dev`     | Starts the local dev server at `localhost:4321`                 |
| `npm run build`   | Builds the production site to `./dist/`                        |
| `npm run preview` | Previews the production build locally                          |
| `npm test`        | Runs the data-layer regression tests                           |
| `npm run astro …` | Runs Astro CLI commands (e.g. `astro check`)                   |

## 📁 Project structure

```text
/
├── public/
│   └── sounds/            # ambient loops (lofi, rain, cafe, campfire, birds, keyboard)
├── src/
│   ├── components/        # the floating widgets + the background library drawer
│   ├── layouts/
│   │   └── Layout.astro   # document shell, fonts, meta tags
│   ├── pages/
│   │   └── index.astro    # app shell: widget manager, video system, auth state
│   ├── styles/
│   │   └── global.css     # design tokens, glass/elevation system, motion
│   └── utils/
│       ├── UserStore.ts   # user profile, sessions, activity, stats, achievements
│       ├── VideoDatabase.ts# the background/space catalogue and user uploads
│       └── toast.ts       # toasts, undo actions, screen-reader announcements
└── tests/
    └── userstore.test.ts  # regression tests for the data layer
```

## 🧩 The widgets

| Widget        | What it does                                                        |
| :------------ | :------------------------------------------------------------------ |
| Timer         | Pomodoro / short / long break, drift-free countdown, session history |
| Ambient mixer | Six looping sounds, per-track volume, presets, mute/stop, persisted  |
| Task list     | Add, complete and delete tasks, with undo and task-count statistics  |
| Notes         | Tabbed notes with autosave                                          |
| Breathe       | Configurable 4-4-6 breathing guide with phase chimes                |
| Statistics    | Focus totals, streaks, 7-day heatmap, achievements                  |
| Spaces        | Video spaces, static backgrounds and your own uploads                |

Every widget can be dragged, minimised, hidden from the left dock, and is laid out
per-account in `localStorage`.

## ♿ Accessibility notes

- Visible focus rings on every interactive element (`:focus-visible`).
- Keyboard support for the drawer, the modal, the tabs and the space cards.
- Focus is trapped in the drawer and the sign-in modal, and restored on close.
- `prefers-reduced-motion` disables the ambient gradient, the spinner and transitions.
- Zoom is never blocked (`user-scalable=no` was removed).
- Live regions announce timer phases, task counts and toasts.
