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
      "From flight software for a small satellite to websites for paying clients and AI assistants, I build the whole system.",
      "Computer Systems Engineer · B.S. Cum Laude, University of Georgia, Class of 2026.",
    ],
    tagline: "WEB · AI · HARDWARE · VR",
    recentLabel: "RECENT BUILDS",
    // Right-rail projects (by slug in ../../data) revealed additively, each linked.
    recentProjectIds: ["otto", "exocortex", "windowpet", "freight-carrier-website"],
    scrollCue: "SCROLL TO EXPLORE",
  },

  // ── What I Build ─────────────────────────────────────────────────────────
  whatIMake: {
    eyebrow: "WHAT I BUILD",
    title: ["Engineering across", "the full", "stack."], // middle word italic
    intro:
      "I build complete products, from the code that runs on a circuit board to the app or website in your hands.",
    pillars: [
      {
        n: "01",
        title: "Websites & Web Apps",
        desc: "Websites for paying clients, live voting used in a real campus election, and an order system for online stores that never sells more than it has.",
        tags: ["NEXT.JS", "REACT", "POSTGRES"],
        to: "/work?cat=web",
      },
      {
        n: "02",
        title: "AI Assistants",
        desc: "Assistants that answer with sources, remember what you've read and written, and only act after you say yes. Built on Claude and on AI models that run on your own computer.",
        tags: ["CLAUDE API", "MCP", "MLX"],
        to: "/work?cat=ai",
      },
      {
        n: "03",
        title: "Hardware & Devices",
        desc: "The code inside small devices and the circuit boards they run on: flight software for a satellite, a pet bed that reads a dog's heartbeat, and an LED wall that shows album art.",
        tags: ["C / C++", "FPGA", "KICAD"],
        to: "/work?cat=embedded",
      },
      {
        n: "04",
        title: "VR, Games & Research",
        desc: "A two-player VR cooking game, a game prototype set in Pompeii's last hours, tiny fluid-mixing chips made in a cleanroom, and research on how people use technology.",
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

  // ── Editorial block (the Workstation card next to the IDE preview) ──────────
  editorial: {
    community: {
      eyebrow: "THE WORKSTATION",
      title: "There's a working code editor under the hood.",
      body:
        "The workstation works like a code editor. Every project is a file you can open to see its 3D model, and there's a working terminal at the bottom.",
      cta: { label: "Open the workstation", href: "/workstation" },
    },
  },

  // ── For teams / recruiters ───────────────────────────────────────────────
  forBrands: {
    eyebrow: "FOR TEAMS",
    label: "NOW AT YAMAHA",
    title: "An engineer who builds the whole product.",
    body:
      "University of Georgia graduate (B.S. Computer Systems Engineering, Morehead Honors, cum laude, May 2026). I'm a Full Stack Developer at Yamaha Motor, where I look after the AI assistant on its online store. Before that I spent six months building websites for paying clients as a freelance software engineer. I'm not looking for a new job, but I'm always glad to talk about the work.",
    tags: ["FULL-STACK WEB", "AI / AGENTS", "EMBEDDED / FIRMWARE", "XR & GAMES", "PRODUCT & DATA"],
    cta: { label: "Download résumé", href: "/resume.pdf" },
    contact: { label: "Email me", href: "mailto:jalen.edusei@gmail.com" },
  },

  // ── About ─────────────────────────────────────────────────────────────────
  about: {
    eyebrow: "ABOUT",
    title: ["The engineer", "behind", "it all."], // middle word italic
    greeting: "Hi, I'm Jalen.",
    bio:
      "Computer Systems Engineer from the University of Georgia (Morehead Honors, Cum Laude, Class of 2026). I build websites for real clients, AI assistants, the software inside small devices, and multiplayer VR games. These days I'm a Full Stack Developer at Yamaha Motor Corporation, U.S.A. Before that I built websites as a freelance software engineer (kulenterprises.com, akilahmali.com and cake-artista.vercel.app are mine) and interned as a Business Analyst at Capital One on the CreditWise team.",
    info: [
      { label: "DEGREE", value: "B.S. Computer Systems Engineering, Cum Laude" },
      { label: "SCHOOL", value: "University of Georgia · Morehead Honors" },
      { label: "BASED", value: "Atlanta, GA" },
      { label: "FOCUS", value: "Web · AI · Hardware · VR" },
    ],
  },

  // ── Start here (final CTA) ────────────────────────────────────────────────
  startHere: {
    eyebrow: "GET IN TOUCH",
    title: ["Let's build", "something."], // 2nd word italic
    body:
      "Tell me about a project, ask about anything you saw here, or just say hello. Email is the fastest way to reach me: jalen.edusei@gmail.com.",
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
