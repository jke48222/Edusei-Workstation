# Jalen Edusei — Portfolio

The personal portfolio of **Jalen Edusei**, Computer Systems Engineer (B.S., University of Georgia '26).

**Live:** https://www.jalenedusei.com

Two experiences, one codebase:

- **`/` — the home portfolio.** A scroll-scrubbed video landing where a single fixed video eases frame-by-frame to your scroll position. Bone-and-ink design system in DM Sans: an additive-reveal hero, four "what I build" pillars, a Selected Work grid with live previews, the full skill set with brand icons, experience, recognition, certifications, an animated CRT terminal, and contact. Built library-free for motion (rAF + IntersectionObserver).
- **`/workstation` — the 3D workstation.** The original immersive sub-experience: a retro CRT terminal on a 3D desk you can explore, built with React Three Fiber, with cinematic camera transitions and a clickable hardware scene.

Plus a project archive at **`/work`** and detail pages at **`/work/:id`**, themed to match the home page.

## Quick start

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # eslint
```

## Routes

| Route          | What it is                                                            |
| -------------- | --------------------------------------------------------------------- |
| `/`            | Home — the scroll-scrubbed video portfolio                            |
| `/work`        | Project archive (filterable grid of every project)                    |
| `/work/:id`    | Project detail page (story, tech, demos, gallery, related)            |
| `/workstation` | The immersive 3D CRT workstation                                      |

The home, work, and workstation cross-link to each other (header, footer, search, and the workstation's Home/Work pills). Heavy dependencies (three.js, framer-motion) are lazy-loaded, so the home page's initial bundle stays light.

## Project structure

```
index.html                 # entry HTML (fonts, meta, scroll-bar styles)
src/
├── app/
│   ├── main.tsx            # React entry — router + custom cursor
│   └── App.tsx             # Workstation route shell + shared chrome
├── data/
│   └── index.ts            # Single source of truth: profile, projects, skills,
│                           #   experience, honors, leadership, certifications
├── styles/
│   └── index.css           # Tailwind layers + 3 scoped design systems:
│                           #   .landing (home), .work-theme (work pages), .pf/CRT
├── landing/                # The home portfolio ("/")
│   ├── Landing.tsx         # Page composition + scroll container
│   ├── content/site.ts     # Editorial copy for the home page
│   ├── lib/                # hooks (rAF scroll progress, in-view) + tech-icon map
│   └── components/         # Header, Hero (ScrubVideo), search, and sections/
├── components/
│   ├── Experience.tsx      # R3F Canvas + 3D workstation scene
│   ├── CameraRig.tsx       # Camera transitions (maath easing)
│   ├── Overlay.tsx         # CRT terminal UI
│   ├── *Cursor.tsx         # Custom cursors (dot-ring on bone, reticle in 3D)
│   ├── minigame/           # Kitchen Chaos mini-game overlay
│   └── work/               # /work + /work/:id pages and their ui/ kit
├── store/                  # Zustand stores (workstation + theme)
├── hooks/                  # Shared hooks (mobile, konami)
└── utils/                  # Terminal sound, etc.
public/
├── media/hero.mp4          # The scroll-scrubbed hero clip + poster
├── icons/                  # Monochrome brand logos (simple-icons) for skills
├── models/                 # glTF models for the 3D workstation
├── brand/headshot.png      # Headshot
└── resume.pdf, cv.pdf      # Documents
```

## Design systems

Three palettes coexist without colliding, each namespaced in `src/styles/index.css`:

- **`.landing`** — the home page. Bone (`#f6f5f2`) + ink (`#0a0a0a`), DM Sans. Sections sit transparently over the fixed video; text is **ink** over the bright top of the clip and **white** over the dark lower portion, so it stays legible without a gray overlay.
- **`.work-theme`** — `/work` and `/work/:id`. Re-skins the shared project components to the same monochrome bone/ink + DM Sans.
- **`.pf` / CRT** — the 3D workstation's themeable terminal palette (untouched by the above).

## Content

Everything recruiter-facing lives in **`src/data/index.ts`** (`profileData`, `projectsData`, `skillsData`, `workExperience`, `leadership`, `honors`, `certifications`). Editorial copy for the home page is in **`src/landing/content/site.ts`**. Update those two files to change the site's content.

## Tech stack

- **Framework:** React 18 + Vite + TypeScript
- **Routing:** React Router
- **3D:** @react-three/fiber, @react-three/drei (workstation only, lazy-loaded)
- **Animation:** rAF + IntersectionObserver (home), framer-motion (work pages, lazy), maath (camera)
- **State:** Zustand
- **Styling:** Tailwind CSS
- **Icons:** lucide-react + monochrome [simple-icons](https://simpleicons.org) served from `/public/icons`

## Notes

- **Hero video.** `public/media/hero.mp4` is a 1080p60 all-intra clip (~38 MB) for smooth frame-by-frame scrubbing; serve it with long cache headers. `prefers-reduced-motion` users get a static poster frame.
- **Skill icons** are fetched once from simple-icons and committed under `public/icons/` so the page has no runtime icon dependency.

## 3D model attributions

| Model                                  | Creator             | License                                                       |
| -------------------------------------- | ------------------- | ------------------------------------------------------------ |
| [Meta Quest 3](https://skfb.ly/oNCEG)  | Elin                | [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)     |
| [Capital One](https://skfb.ly/px9vD)   | Laurance Animations | [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)     |

Additional models (Robot Car, Sleeping Dog, Satellite) are in `/public/models/`.

---

**Jalen Edusei** · [jalenedusei.com](https://www.jalenedusei.com) · [github.com/jke48222](https://github.com/jke48222)
