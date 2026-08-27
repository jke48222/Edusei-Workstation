# Edusei Workstation

My personal portfolio, built as a code editor you can actually use. Every project I have worked on
appears as a file in an explorer. You open it, and the file's contents are the project itself: a 3D
model, a screen capture, a screenshot, or the live site running in browser chrome.

**Live at [jalenedusei.com](https://www.jalenedusei.com)**

## What problem this solves

A portfolio site asks a stranger to read about work they cannot see. Most of my projects are not
screenshots, they are systems: an LED wall, a memory store, a desktop creature, an order pipeline.
Describing those in a paragraph loses the thing that makes them interesting.

So the site does not describe the work, it hands you the work. The interface is the one I spend my
day in, a code editor, which means a recruiter who is also an engineer already knows how to navigate
it. Press Cmd+P and type a project name. Search the whole portfolio full-text. Open three projects
as tabs and compare them. The familiarity is the point: no one needs a tutorial for an explorer
pane and a tab bar.

## The three routes

| Route | What it is |
| --- | --- |
| `/` | The landing page. A single video scrubbed frame by frame by your scroll position. |
| `/workstation` | The editor. Every project as a file, with search, tabs, a terminal, and themes. |
| `/work`, `/work/:id` | A conventional filterable archive, for people who would rather just read. |

All three share one content source, so nothing is written twice.

### The landing page

The background is one video. As you scroll, the video seeks to match your scroll position, so
scrolling is scrubbing. There is no animation library involved: it is a requestAnimationFrame loop
that eases the video's `currentTime` toward a target derived from scroll offset.

Two details make it work in practice, both in
[`src/landing/components/ScrubVideo.tsx`](src/landing/components/ScrubVideo.tsx):

- **It sleeps.** When a seek settles, the loop stops and re-arms on the next scroll or resize event,
  rather than running a permanent 60 Hz loop that burns battery on a page nobody is scrolling.
- **It survives iOS Safari.** A video element that has never played will not repaint when you seek
  it, so the page shows a frozen poster frame on iPhone. The fix is a muted play-then-pause to prime
  the decoder, with a touch-gesture fallback for Low Power Mode, which blocks even that.

Readers who have `prefers-reduced-motion` set never download the video at all. They get a poster
frame.

### The workstation editor

A working imitation of VS Code in the browser: file explorer, Quick Open, command palette,
full-text search across every project, a resizable sidebar, tab management, a typeable terminal
(`help`, `ls`, `open`, `theme`, `resume`, `clear`), and nine color themes.

The part worth reading is
[`src/components/ide/projectRegistry.ts`](src/components/ide/projectRegistry.ts). The file tree is
not hand-maintained. It derives from the same project data that feeds `/work`, so adding one entry
to [`src/data/index.ts`](src/data/index.ts) makes that project appear in the explorer, in Quick
Open, in the command palette, in search, and in the terminal, with no other wiring. Filenames and
syntax languages are inferred from each project's tech stack, with per-project overrides at the top
of the registry.

Each project file opens as the richest medium available for it, falling back down the chain: 3D
model, capture clip, screenshot, live site embed, and finally a plain document.

## Results

Honest accounting of what has and has not been measured here.

| Measured | Value | Where |
| --- | --- | --- |
| Landing page bundle savings | About 310 KB gzipped removed from first load | [`vite.config.ts`](vite.config.ts) |
| Entry JavaScript chunk | 312 KB raw, 100 KB gzipped | `dist/` build output |
| three.js chunk (lazy, not on landing) | 676 KB raw, 177 KB gzipped | `dist/` build output |
| TypeScript source | 16,112 lines across 72 files | `src/` |

The bundle number came from a real negative result. An earlier `manualChunks` configuration looked
tidier but pulled three.js and react-three-fiber into the eager chunk graph for the landing page,
which does not render any 3D at all. The comment recording that measurement is still in
[`vite.config.ts`](vite.config.ts), because the tidier version is the one a future reader would be
tempted to restore.

**Not measured, and therefore not claimed:** frame rate. There is no profiler output, Lighthouse
report, or frame-timing instrumentation in this repo. The scrub loop is built to be cheap and it
feels smooth on the devices I own, but "60 FPS" is an impression here, not a measurement.

**Not tested:** this repo has no test suite. There is no Jest, Vitest, or Playwright setup and no
test files. Cross-browser behavior was handled by hand, specifically the iOS Safari repaint bug
above, not by an automated matrix.

## Progressive web app

Installable and works offline for static content, using a hand-written service worker rather than
Workbox or a Vite plugin.

- [`public/manifest.json`](public/manifest.json): standalone display, scope, start URL, theme and
  background colors, 192 px, 512 px, and SVG icons.
- [`public/sw.js`](public/sw.js): 54 lines. Versioned cache, precaches a six-URL app shell on
  install, drops stale caches on activate, network-first with cache fallback, evicts past 150
  entries, and deliberately skips `.mp4`, `.webm`, `.glb`, `.gltf`, and `.hdr` so that multi-megabyte
  models never fill the origin's storage quota.
- Registered in [`src/app/main.tsx`](src/app/main.tsx), gated to production builds only.

There is no Lighthouse audit artifact committed, so treat the PWA status as "installable and
offline-capable," not as an audited score.

## Running it

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # eslint
```

The service worker only registers in production builds, so use `npm run preview` rather than
`npm run dev` to test offline behavior.

## Project layout

```
src/
├── app/                    React entry, router, custom cursor
├── data/index.ts           Single source of truth: profile, projects, skills,
│                           experience, honors, certifications
├── landing/                The "/" route
│   ├── Landing.tsx         Page composition and scroll container
│   ├── content/site.ts     Editorial copy for the landing page
│   └── components/         Header, hero (ScrubVideo), search, sections
├── components/
│   ├── ide/                The workstation editor
│   │   ├── Ide.tsx             Shell: tabs, keybindings, terminal
│   │   ├── projectRegistry.ts  Projects to file tree (see above)
│   │   ├── SideBar.tsx         Explorer, search, source control, run panels
│   │   ├── EditorArea.tsx      Tabs and per-project custom editors
│   │   └── ModelViewer.tsx     3D model as a file's contents (lazy loaded)
│   ├── work/               The /work archive and detail pages
│   └── game/               Kitchen Chaos 2D, complete but unwired (see Status)
├── store/                  Zustand stores for workstation and theme state
├── styles/index.css        Tailwind layers plus three scoped design systems
└── hooks/                  Shared hooks (mobile detection, konami)

public/
├── media/                  Hero video and poster
├── models/                 glTF models shown inside editor tabs (27 MB)
├── icons/                  Monochrome brand logos, committed to avoid a runtime dependency
└── manifest.json, sw.js    PWA manifest and service worker
```

## Design systems

Three palettes coexist without colliding, each namespaced in
[`src/styles/index.css`](src/styles/index.css):

- `.landing`, the landing page. Bone (`#f6f5f2`) and ink (`#0a0a0a`) in DM Sans. Sections sit
  transparently over the fixed video, so text is ink over the bright top of the clip and white over
  the darker lower portion. That avoids muddying the video with a gray scrim just to win contrast.
- `.work-theme`, the `/work` pages, reskinning the shared project components to the same monochrome.
- `.pf`, the editor's themeable palette, driving all nine themes and untouched by the other two.

## Media pipeline

Video for this site needs an alpha channel, and the only format that carries alpha on iOS Safari is
HEVC, which cannot be produced on a Linux CI runner. So
[`.github/workflows/convert-to-hevc.yml`](.github/workflows/convert-to-hevc.yml) runs the conversion
on a macOS runner, and [`scripts/`](scripts/) holds the Blender export and local conversion
equivalents. The workflow currently names its input files explicitly, so adding a clip means editing
the workflow.

## Tech stack

React 18, TypeScript 5.6, Vite 5, React Router 6, Tailwind CSS 3.4, Zustand 5. three.js 0.170 with
react-three-fiber and drei, lazy loaded and used only inside editor tabs. Framer Motion 11 on the
`/work` pages, deliberately absent from the landing page, whose motion is hand-rolled.

## Status

Shipped and live. 113 commits.

Known gaps, in the order I would fix them:

- **No tests.** The highest-value addition would be a smoke test asserting that every project in
  `src/data/index.ts` resolves to an openable file in the registry, since that mapping is the site's
  single point of failure.
- **3D models are unoptimized.** 27 MB of glTF in `public/models/` with no Draco or meshopt
  compression and no level-of-detail. They are lazy loaded and excluded from the service worker
  cache, so they do not hurt first paint, but they are heavy when opened.
- **Kitchen Chaos 2D** in `src/components/game/` is complete but intentionally unwired. Nothing
  imports it, so it stays out of the bundle. See `kitchenGameOpen` in `src/store/store.ts` to
  restore it.
- **The HEVC workflow is not generic**, as noted above.

## 3D model attributions

| Model | Creator | License |
| --- | --- | --- |
| [Meta Quest 3](https://skfb.ly/oNCEG) | Elin | [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) |
| [Capital One](https://skfb.ly/px9vD) | Laurance Animations | [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) |

Additional models (robot car, sleeping dog, satellite) are in `public/models/`.

---

Jalen Edusei, [jalenedusei.com](https://www.jalenedusei.com),
[github.com/jke48222](https://github.com/jke48222)
