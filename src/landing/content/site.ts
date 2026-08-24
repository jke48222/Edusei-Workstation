/**
 * SITE CONTENT & BRAND CONFIG for the home page (the scroll-scrubbed video portfolio).
 * Editorial copy lives here; structured data (experience, skills, projects, honors,
 * certifications) is sourced from the single source of truth in ../../data.ts.
 */

export const site = {
  // ── Identity ────────────────────────────────────────────────────────────
  name: "Jalen Edusei",
  brand: "Jalen Edusei",
  role: "SOFTWARE ENGINEER",
  tagline: "Software Engineer · UGA '26",
  degree: "B.S. Computer Systems Engineering, Cum Laude · University of Georgia '26",
  niche: "Full-stack software engineer shipping production sites for real clients, AI systems on the Claude API, and embedded hardware.",
  email: "jalen.edusei@gmail.com",

  // ── Links ──────────────────────────────────────────────────────────────
  socials: {
    github: "https://github.com/jke48222",
    linkedin: "https://www.linkedin.com/in/jalenedusei",
    email: "mailto:jalen.edusei@gmail.com",
    resume: "/resume.pdf",
    cv: "/cv.pdf",
    source: "https://github.com/jke48222/edusei-workstation",
    site: "https://www.jalenedusei.com",
  },

  // ── Navigation (anchors map to section ids) ──────────────────────────────
  nav: [
    { label: "Work", href: "#work" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],

  // ── Hero (additive reveals over the scroll-scrubbed video) ───────────────
  hero: {
    eyebrow: "JALEN EDUSEI · SOFTWARE ENGINEER",
    headline: { line1: "Building software", line2: "with real", accent: "impact." },
    // Supporting lines that fade in additively as the hero scrolls (they stack,
    // they don't replace each other), each at a narrower width.
    reveals: [
      "From CubeSat flight software to production client sites and agentic AI, I build the whole system.",
      "Computer Systems Engineer · B.S. Cum Laude, University of Georgia, Class of 2026.",
    ],
    tagline: "FULL-STACK · AI · EMBEDDED · XR",
    recentLabel: "RECENT BUILDS",
    // Right-rail projects (by slug in ../../data) revealed additively, each linked.
    recentProjectIds: ["exocortex", "windowpet", "freight-carrier-website", "relay-oms"],
    scrollCue: "SCROLL TO EXPLORE",
  },

  // ── What I Build ─────────────────────────────────────────────────────────
  whatIMake: {
    eyebrow: "WHAT I BUILD",
    title: ["Engineering across", "the full", "stack."], // middle word italic
    intro:
      "I build the whole system, from the firmware on the board to the interface in your hands.",
    pillars: [
      {
        n: "01",
        title: "Full-Stack Web",
        desc: "Production client sites, realtime platforms, and an event-driven order system. Next.js, React, Supabase, and Phoenix, shipped on Vercel.",
        tags: ["NEXT.JS", "REACT", "POSTGRES"],
        to: "/work?cat=web",
      },
      {
        n: "02",
        title: "AI & Agents",
        desc: "Agentic assistants and retrieval systems built directly on the Claude API and on-device models: tool use, MCP servers, and evaluation harnesses.",
        tags: ["CLAUDE API", "MCP", "MLX"],
        to: "/work?cat=ai",
      },
      {
        n: "03",
        title: "Embedded & Hardware",
        desc: "C and C++ on STM32, ESP32, and Raspberry Pi, FPGA design in Verilog, and PCB design in KiCad. CubeSat flight software, contactless vitals, LED walls.",
        tags: ["C / C++", "FPGA", "KICAD"],
        to: "/work?cat=embedded",
      },
      {
        n: "04",
        title: "XR & Research",
        desc: "Multiplayer VR for the Quest 3, a UE5 vertical slice, cleanroom microfluidics, and HCI research. Engineering with a reason behind it.",
        tags: ["UNITY", "UE5", "HCI"],
        to: "/work?cat=vr",
      },
    ],
  },

  // ── Skills heading ───────────────────────────────────────────────────────
  stack: {
    eyebrow: "TOOLS & TECHNOLOGIES",
    title: "A broad, hands-on toolset.",
    count: "80+ TECHNOLOGIES",
  },

  // ── Experience heading ───────────────────────────────────────────────────
  experience: {
    eyebrow: "EXPERIENCE",
    title: ["Where I've", "worked."],
  },

  // ── Recognition heading ──────────────────────────────────────────────────
  recognition: {
    eyebrow: "RECOGNITION",
    title: ["Honors, leadership, and", "the work behind them."],
  },

  // ── Certifications heading ───────────────────────────────────────────────
  certifications: {
    eyebrow: "CREDENTIALS",
    title: ["Certifications &", "programs."],
  },

  // ── Editorial block (the Workstation card next to the terminal) ──────────
  editorial: {
    community: {
      eyebrow: "THE WORKSTATION",
      title: "There's a working IDE under the hood.",
      body:
        "The workstation view runs like a code editor: your projects are files in an explorer, opening one loads its 3D model as the file contents, and there is a real terminal at the bottom. Built with React Three Fiber.",
      cta: { label: "Open the IDE", href: "/workstation" },
    },
  },

  // ── Terminal widget ──────────────────────────────────────────────────────
  terminal: {
    label: "EDUSEI IDE",
    meta: "v2.026",
    boot: [
      "EDUSEI IDE v3.026",
      "Restoring workspace...",
      "Indexing 30+ shipped projects...",
      "Workspace ready.",
    ],
    commands: [
      { cmd: "whoami", out: "Jalen Edusei · B.S. Computer Systems Engineering, UGA '26" },
      { cmd: "open projects/animaldot.cpp", out: "Contactless vitals via geophone DSP: ONLINE" },
      { cmd: "ls --domains", out: "embedded  vr-xr  full-stack  hardware  research" },
      { cmd: "ls clients/", out: "kulenterprises.com  akilahmali.com  ops-portal (private)" },
      { cmd: "cat status.txt", out: "Open to full-time software roles: full-stack, AI, embedded" },
    ],
  },

  // ── For teams / recruiters ───────────────────────────────────────────────
  forBrands: {
    eyebrow: "FOR TEAMS",
    label: "OPEN TO OPPORTUNITIES",
    title: "Need someone who can go from firmware to front-end?",
    body:
      "Recent University of Georgia graduate (B.S. Computer Systems Engineering, Morehead Honors, cum laude, May 2026), now shipping production sites for paying clients as a freelance software engineer. I'm open to full-time software roles across full-stack, AI, and embedded, and I bring a habit of shipping tested, measured systems.",
    tags: ["FULL-STACK WEB", "AI / AGENTS", "EMBEDDED / FIRMWARE", "XR & GAMES", "PRODUCT & DATA"],
    cta: { label: "Download résumé", href: "/resume.pdf" },
  },

  // ── About ─────────────────────────────────────────────────────────────────
  about: {
    eyebrow: "ABOUT",
    title: ["The engineer", "behind", "it all."], // middle word italic
    greeting: "Hi, I'm Jalen.",
    bio:
      "Computer Systems Engineer from the University of Georgia (Morehead Honors, Cum Laude, Class of 2026). I build across the whole stack: production client websites and realtime platforms, agentic AI systems on the Claude API, embedded firmware and signal processing, and multiplayer VR for the Quest 3. These days I ship as a freelance software engineer (kulenterprises.com and akilahmali.com are mine) after a Business Analyst internship at Capital One on the CreditWise team.",
    info: [
      { label: "DEGREE", value: "B.S. Computer Systems Engineering, Cum Laude" },
      { label: "SCHOOL", value: "University of Georgia · Morehead Honors" },
      { label: "BASED", value: "Atlanta, GA" },
      { label: "FOCUS", value: "Full-Stack · AI · Embedded · XR" },
    ],
  },

  // ── Start here (final CTA) ────────────────────────────────────────────────
  startHere: {
    eyebrow: "GET IN TOUCH",
    title: ["Let's build", "something."], // 2nd word italic
    body:
      "I'm open to software, technology, business, and data roles across all domains, and always happy to talk shop. The fastest way to reach me is email, at jalen.edusei@gmail.com.",
    subscribeCta: "Say hi!",
  },

  footer: {
    copyright: "© 2026 Jalen Edusei. Built with React, Three.js, and care.",
  },
};

// Social/links row used in hero, CTA, footer
export const socialRow = [
  { label: "GitHub", short: "GITHUB", href: site.socials.github },
  { label: "LinkedIn", short: "LINKEDIN", href: site.socials.linkedin },
  { label: "Email", short: "EMAIL", href: site.socials.email },
  { label: "Résumé", short: "RÉSUMÉ", href: site.socials.resume },
  { label: "CV", short: "CV", href: site.socials.cv },
];

export type Site = typeof site;
