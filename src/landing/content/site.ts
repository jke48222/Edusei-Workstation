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
  degree: "B.S. Computer Systems Engineering · University of Georgia '26",
  niche: "Computer Systems Engineer building across embedded systems, VR, and the web.",
  email: "jalen.edusei@gmail.com",
  locations: "Athens, GA",

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
    headline: { lead: "Building software with real", accent: "impact." },
    // Supporting lines that fade in additively as the hero scrolls (they stack,
    // they don't replace each other), each at a narrower width.
    reveals: [
      "From CubeSat flight software to multiplayer VR, I build the whole system.",
      "Computer Systems Engineer · B.S., University of Georgia, Class of 2026.",
    ],
    tagline: "HARDWARE-DEEP · PRODUCT-MINDED",
    recentLabel: "RECENT BUILDS",
    // Right-rail projects (by slug in ../../data) revealed additively, each linked.
    recentProjectIds: ["animaldot", "parmco-ble-motor", "primeforge-fpga", "atlas-job-search"],
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
        title: "Embedded & Firmware",
        desc: "C and C++ on STM32, ESP32, and Raspberry Pi. CubeSat flight software, contactless vitals sensing, and closed-loop control.",
        tags: ["C / C++", "STM32", "DSP"],
        to: "/work/animaldot",
      },
      {
        n: "02",
        title: "VR / XR",
        desc: "Immersive multiplayer experiences for the Meta Quest 3 in Unity, with hand tracking, networking, and physics.",
        tags: ["UNITY", "C#", "OPENXR"],
        to: "/work/kitchen-chaos-vr",
      },
      {
        n: "03",
        title: "Full-Stack Web",
        desc: "Production sites and realtime apps with Next.js, React, and Supabase, shipped on Vercel.",
        tags: ["NEXT.JS", "REACT", "SUPABASE"],
        to: "/work/musical-artist-site",
      },
      {
        n: "04",
        title: "Product & Research",
        desc: "Business cases at Capital One, microfluidics in the cleanroom, and HCI research. Engineering with a reason behind it.",
        tags: ["STRATEGY", "HCI", "RESEARCH"],
        to: "/work/capital-one",
      },
    ],
  },

  // ── Skills heading ───────────────────────────────────────────────────────
  stack: {
    eyebrow: "TOOLS & TECHNOLOGIES",
    title: "A broad, hands-on toolset.",
    count: "70+ TECHNOLOGIES",
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

  // ── Editorial blocks (Approach / Craft / Workstation) ────────────────────
  editorial: {
    approach: {
      eyebrow: "THE APPROACH",
      title: "Build it, then prove it.",
      body:
        "Every project here is a real system I shipped, from breadboard to deploy. I care about the unglamorous parts: the tests, the edge cases, the details that decide whether it holds up in the field.",
      cta: { label: "See the work", href: "#work" },
      bigWord: "Ship.",
    },
    craft: {
      eyebrow: "THE CRAFT",
      title: "Hardware-deep, product-minded.",
      body:
        "Years across embedded labs, a CubeSat flight-software team, and a Capital One internship. I care as much about why a thing should exist as whether the firmware boots.",
      cta: { label: "About me", href: "#about" },
      bigWord: "Craft.",
    },
    community: {
      eyebrow: "THE WORKSTATION",
      title: "There's a terminal under the hood.",
      body:
        "I built a 3D workstation you can actually explore: a retro CRT terminal, clickable hardware, the whole desk. Built with React Three Fiber, and it holds 60fps even on a phone.",
      cta: { label: "Visit the workstation", href: "/workstation" },
    },
  },

  // ── Terminal widget ──────────────────────────────────────────────────────
  terminal: {
    label: "EDUSEI WORKSTATION",
    meta: "v2.026",
    boot: [
      "EDUSEI WORKSTATION v2.026",
      "Booting Computer Systems Engineer...",
      "Loading 25+ shipped projects...",
      "System ready.",
    ],
    commands: [
      { cmd: "whoami", out: "Jalen Edusei · B.S. Computer Systems Engineering, UGA '26" },
      { cmd: "run animaldot.exe", out: "Contactless vitals via geophone DSP: ONLINE" },
      { cmd: "ls --domains", out: "embedded  vr-xr  full-stack  hardware  research" },
      { cmd: "cat status.txt", out: "Open to software, technology, business & data roles" },
    ],
  },

  // ── For teams / recruiters ───────────────────────────────────────────────
  forBrands: {
    eyebrow: "FOR TEAMS",
    label: "OPEN TO OPPORTUNITIES",
    title: "Need someone who can go from firmware to front-end?",
    body:
      "Recent University of Georgia graduate (B.S. Computer Systems Engineering, Morehead Honors, May 2026). I'm open to software, technology, business, and data roles across all domains, and I bring real breadth across the stack with a habit of shipping tested systems, not just demos.",
    tags: ["SOFTWARE", "EMBEDDED / FIRMWARE", "FULL-STACK WEB", "VR / XR", "PRODUCT & DATA"],
    cta: { label: "Download résumé", href: "/resume.pdf" },
  },

  // ── About ─────────────────────────────────────────────────────────────────
  about: {
    eyebrow: "ABOUT",
    title: ["The engineer", "behind", "it all."], // middle word italic
    greeting: "Hi, I'm Jalen.",
    bio:
      "Computer Systems Engineer from the University of Georgia (Morehead Honors, Class of 2026). I build across the whole stack: embedded firmware and signal processing, multiplayer VR for the Meta Quest 3, and full-stack web shipped on Vercel. Most recently I was a Business Analyst intern at Capital One, building the business case for a notifications center serving 60M+ CreditWise users.",
    info: [
      { label: "DEGREE", value: "B.S. Computer Systems Engineering" },
      { label: "SCHOOL", value: "University of Georgia · Morehead Honors" },
      { label: "BASED", value: "Athens, GA" },
      { label: "FOCUS", value: "Embedded · VR · Full-Stack · Product" },
    ],
  },

  // ── Start here (final CTA) ────────────────────────────────────────────────
  startHere: {
    eyebrow: "GET IN TOUCH",
    title: ["Let's build", "something."], // 2nd word italic
    body:
      "I'm open to software, technology, business, and data roles across all domains, and always happy to talk shop. The fastest way to reach me is email, at jalen.edusei@gmail.com.",
    subscribeCta: "Say hi!",
    emailPlaceholder: "you@company.com",
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
