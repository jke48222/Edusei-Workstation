import type { ViewState } from '../store/store.ts';

/**
 * Project data interface defining the structure for portfolio projects.
 * Aligns with ViewState type for 3D object mapping in the immersive workstation view.
 */
export interface ProjectData {
  id: ViewState;
  executable: string;
  title: string;
  tagline: string;
  description: string[];
  techStack: string[];
  period: string;
  location: string;
  objectLabel: string;
  accentColor: string;
  github?: string;
  additionalProjects?: {
    title: string;
    period: string;
    github?: string;
    description: string[];
  }[];
}

export const profileData = {
  name: 'Jalen Edusei',
  title: 'Software Engineer',
  university: 'University of Georgia',
  college: 'College of Engineering, Morehead Honors College',
  degree: 'B.S. Computer Systems Engineering, Cum Laude',
  graduationYear: 2026,
  graduated: true,
  email: 'jalen.edusei@gmail.com',
  linkedin: 'linkedin.com/in/jalenedusei',
  github: 'github.com/jke48222',
  resumeUrl: '/resume.pdf',
  cvUrl: '/cv.pdf',
  openForWork: true,
  birthday: '09-28',
};

export function getSayHiMailto(): string {
  // The visitor is the sender — the subject must not claim to be "from" the site owner.
  const subject = encodeURIComponent(`Say hi (via ${profileData.name}'s portfolio)`);
  const body = encodeURIComponent(
    `Hi ${profileData.name},\n\nI came across your portfolio and wanted to reach out.\n\n`
  );
  return `mailto:${profileData.email}?subject=${subject}&body=${body}`;
}

export const skillsData = {
  programming: [
    'ARM Assembly', 'C', 'C#', 'C++', 'Elixir', 'GLSL', 'HTML/CSS', 'Java', 'JavaScript',
    'MATLAB', 'MicroPython', 'Python', 'R', 'SQL', 'Swift', 'TypeScript', 'Verilog'
  ],
  software: [
    'AppKit / SwiftUI', 'Blender', 'Docker', 'Kubernetes', 'Figma', 'Git', 'GitHub Actions',
    'KiCad', 'NASA F Prime', 'Next.js', 'Node.js', 'Phoenix / Ecto', 'PlatformIO', 'PostgreSQL',
    'React', 'React Native', 'React Three Fiber', 'Shopify Storefront API', 'SQLite / FTS5',
    'Supabase', 'Tailwind CSS', 'three.js', 'TinaCMS', 'Unity3D', 'Unreal Engine 5', 'Vercel',
    'Vite', 'WordPress', 'Xilinx / Vivado', 'Zephyr'
  ],
  ai: [
    'Anthropic Claude API (Tool Use, Streaming, Structured Outputs)', 'AI-Paired Development (Claude Code, Cursor)',
    'MCP Servers', 'Apple Foundation Models', 'MLX On-Device Inference', 'Hybrid Retrieval (BM25 + Vector)',
    'Prompt Engineering', 'Wit.ai Natural Language Understanding', 'Speech Recognition & Text-to-Speech',
  ],
  hardware: [
    '2U CubeSat', 'BLE GATT (BlueZ / NimBLE / Core Bluetooth)', 'Cleanroom Microfabrication',
    'DSP (Butterworth, Kalman, Peak Detection)', 'ESP32', 'FPGA (Artix-7)', 'Geophones & Load Cells',
    'HUB75 LED Matrices', 'Microfluidics', 'MQTT', 'PCB Design (KiCad)', 'PDMS Soft Lithography',
    'Photolithography', 'Raspberry Pi 4 / 5', 'Raspberry Pi Pico', 'Sensors', 'Signal Processing',
    'ngspice / Multisim Simulation', 'STM32 Microcontrollers'
  ],
  core: [
    'Business Case Development', 'Client Delivery (Discovery to Go-Live)', 'Code Review',
    'Automated Testing', 'Data Analysis', 'Human-Computer Interaction', 'Problem Solving',
    'Product Strategy', 'Project Management', 'Real-Time Systems', 'Technical Communication'
  ],
};


export const workExperience = [
  {
    title: 'Freelance Software Engineer',
    company: 'Self-Employed',
    location: 'Atlanta, GA',
    period: 'May 2026 – Present',
    highlights: [
      'Designed, built, and shipped kulenterprises.com for KUL Enterprises, a Georgia freight carrier: 22 statically generated Next.js pages on a git-backed TinaCMS content model, dependency-free site search, rate-limited forms, and WCAG AA-audited contrast.',
      'Extended the engagement with a broker credit-vetting operations portal on Supabase, with the compliance rules enforced in Postgres itself (row-level security, audit log, atomic SQL functions) behind invite-only auth with four staff roles.',
      'Built and shipped akilahmali.com for recording artist Akilah Mali: a real-time 3D control room in React Three Fiber, a Web Audio rotary payphone, and a headless Shopify commerce integration consolidated onto the hosted storefront.',
    ],
  },
  {
    title: 'Business Analyst Intern',
    company: 'Capital One',
    location: 'McLean, VA',
    period: 'June 2025 – August 2025',
    highlights: [
      'Built the business case for a Notifications Preferences Center for CreditWise, projected to centralize communication management for 60M+ customer accounts, and presented it to senior leadership.',
      'Analyzed performance of CreditWise email campaigns, creating a valuation framework to quantify engagement and retention impact and propose a new email domain.',
      'Partnered with cross-functional teams to present actionable recommendations to senior leadership, driving alignment on future messaging strategy.',
      'Leveraged SQL, Python, Excel, and data visualization tools to evaluate KPIs, delivering insights that informed product roadmap decisions.',
    ],
  },
  {
    title: 'Resident Assistant',
    company: 'University of Georgia Housing',
    location: 'Athens, GA',
    period: 'August 2023 – May 2025',
    highlights: [
      'Cultivated an inclusive community for 45 residents by organizing 10+ educational and social events each semester, boosting resident engagement by 30%.',
      'Mediated and resolved 30+ conflicts and safety concerns, maintaining a secure and supportive environment.',
      'Partnered with housing staff to implement programming focused on academic success and mental health awareness.',
    ],
  },
  {
    title: 'Research Assistant',
    company: 'Joyner Research Laboratory',
    location: 'Athens, GA',
    period: 'September 2022 – May 2023',
    highlights: [
      'Conducted 50+ experiments including ELISAs and DNA/RNA extractions supporting malaria bioinformatics projects.',
      'Analyzed and documented data contributing to 2 peer-reviewed manuscripts.',
      'Designed and launched a new laboratory website, increasing research visibility and engagement by over 500 monthly visitors.',
    ],
  },
  {
    title: 'Shift Leader',
    company: 'Great American Cookies & Marble Slab Creamery',
    location: 'Dallas, GA',
    period: 'May 2022 – July 2022',
    highlights: [
      'Managed daily operations and supervised a team of 5 employees, increasing shift efficiency by 20%.',
      'Processed 100+ customer orders daily with exemplary service, achieving top customer satisfaction ratings.',
      'Trained new staff, improving onboarding time by 40%.',
    ],
  },
];

export const leadership = [
  {
    role: 'Vice President',
    organization: 'National Society of Black Engineers (NSBE)',
    period: 'May 2025 – May 2026',
    highlights: [
      'Led a 100+ member chapter in strategic planning, aligning operations with national initiatives.',
      'Coordinated logistics for national and regional conventions, managing travel for 50+ members.',
      'Designed and implemented a centralized digital resource hub for internship pipelines and alumni contacts.',
    ],
  },
  {
    role: 'Member',
    organization: 'Tau Beta Pi Honor Society',
    period: 'October 2024 – May 2026',
    highlights: [
      'Selected for academic distinction, leadership, and commitment to ethical engineering practice.',
      'Participated in professional development forums and community service events promoting excellence in STEM education.',
    ],
  },
  {
    role: 'Brother',
    organization: 'Theta Tau Fraternity, Iota Epsilon Chapter',
    period: 'January 2024 – May 2026',
    highlights: [
      'Co-organized technical workshops, speaker panels, and community outreach efforts enhancing professional growth for 120+ members.',
      'Fostered fraternity values of brotherhood, service, and lifelong learning through active participation in chapter initiatives.',
    ],
  },
  {
    role: 'Student Advisor',
    organization: 'UGA STEM Academic Success Program',
    period: 'August 2023 – May 2025',
    highlights: [
      'Planned and executed 8+ workshops each semester supporting academic success for 30+ STEM students.',
      'Assisted in strategic programming and mentoring initiatives contributing to increased retention and engagement.',
      "Developed and maintained the organization's digital and social media strategy, increasing online engagement by 50%.",
    ],
  },
  {
    role: 'Senator',
    organization: 'National Society of Black Engineers (NSBE)',
    period: 'May 2024 – May 2025',
    highlights: [
      'Represented chapter at regional and national levels, voting on legislation and advocating for student-centered initiatives.',
      'Led conference interest meetings, managing all travel logistics and budget allocations in coordination with the Treasurer.',
    ],
  },
  {
    role: 'ELS Peer Leader',
    organization: 'Office of Engagement, Leadership, and Service',
    period: 'January 2024 – May 2024',
    highlights: [
      'Selected for leadership coaching program supporting first- and second-year student engagement.',
      'Conducted 1:1 mentorship sessions, connecting students to leadership opportunities and resources.',
      'Facilitated interactive workshops on values-based leadership and self-discovery.',
    ],
  },
  {
    role: 'Telecom & Vice PR Chair',
    organization: 'National Society of Black Engineers (NSBE)',
    period: 'May 2023 – May 2024',
    highlights: [
      'Increased chapter social media engagement by 40% through data-driven content strategies and visual design.',
      'Designed and launched a new chapter website to streamline communication, centralize resources, and showcase events.',
    ],
  },
];

export const studyAbroad = {
  title: 'Study Abroad',
  from: { code: 'USA', city: 'United States' },
  to: { code: 'GER', city: 'Germany' },
  visited: 'Germany · France · Austria',
  depart: 'May 2023',
  ret: 'June 2023',
  term: "Summer '23",
  period: 'May 2023 – June 2023',
  // Short, ticket-sized blurb (drawn from the highlights below).
  description:
    'A summer program on engineering ethics, professionalism, and global collaboration. It paired technical presentations and written case studies with independent travel through Central Europe.',
  // UGA StudyAway program page — encoded into the boarding-pass QR.
  url: 'https://studyaway.uga.edu/index.cfm?FuseAction=Programs.ViewProgramAngular&id=13851',
  host: 'studyaway.uga.edu',
  // Retained for résumé / detail views; not surfaced on the boarding pass.
  highlights: [
    'Completed coursework on engineering ethics, professionalism, and global collaboration, earning 3 credit hours.',
    'Delivered 3 technical presentations and authored 2 academic papers exploring case studies in ethical engineering practice.',
    'Traveled independently to Germany, France, and Austria, building intercultural fluency and adaptability.',
  ],
};

export const honors = [
  { title: 'Extraordinary Engineer', org: 'College of Engineering', date: 'February 2024' },
  { title: 'Presidential Scholar (2x)', org: 'University of Georgia', date: 'December 2022, May 2023' },
  { title: 'Dire Needs Project Fund: $1500 Project Grant', org: 'University of Georgia', date: 'August 2023 – May 2024' },
];

export const certifications = [
  {
    title: 'Emerging Engineering Leadership Development (EELD) Program',
    org: 'UGA College of Engineering · J.W. Fanning Institute for Leadership Development',
    date: 'May 2026',
    summary:
      'Capstone Design leadership program covering conflict resolution, stakeholder engagement, and cross-generational collaboration.',
  },
  {
    title: 'CITI Program: SBE Foundations, Human Subjects Research',
    org: 'University of Georgia',
    date: 'September 2025',
    summary:
      'Foundational training in the ethical and regulatory standards for human subjects research.',
  },
];

export const projectsData: ProjectData[] = [
  {
    id: 'audio-tracking-car',
    executable: 'audiocar',
    title: 'Audio Tracking Car',
    tagline: 'Autonomous audio-frequency navigation system',
    period: 'January 2025 – April 2025',
    location: 'ECSE Design Methodology',
    objectLabel: 'Car',
    accentColor: '#ff6b35',
    github: 'https://github.com/jke48222/Audio-Tracking-Car',
    description: [
      'A little robot car that chases sound. Two microphones and an analog front end work out which direction a tone is coming from, and the car steers toward it.',
      'The direction-finding is all analog: preamps, band-pass filters tuned to the target tones, envelope detectors, and comparator ladders the Pi reads as 4-bit levels. The Pi closes the loop with proportional speed control from optical encoders through a MOSFET H-bridge, and a DIP-switch mode selector with an arming countdown kept it from driving itself off the table.',
    ],
    techStack: ['Python', 'Raspberry Pi 4', 'Analog Filters', 'Comparators', 'Closed-Loop Control'],
    additionalProjects: [
      {
        title: 'LED Frequency Filter',
        period: 'August 2024 – December 2024',
        description: [
          'A circuit that listens to a signal and sorts it into frequency bands, lighting up a different LED for each one so you can actually see sound.',
          'I iterated the design three times, in Multisim and then on the breadboard, fixing voltage attenuation, op-amp inversion, and transition-band false triggers until each band lit cleanly.',
        ],
      },
      {
        title: 'Smart Plant Watering Assistant',
        period: 'August 2025 – November 2025',
        description: [
          "A battery-powered monitor that keeps watch over a plant's world: soil moisture, temperature, and light, with alerts and a little OLED 'mood' face that tells you how it's feeling.",
          'The fun part was the signal work: a photodiode behind an op-amp stage, an analog mux squeezing three sensors into one ADC pin, and a small Kalman filter per channel to calm the noisy readings, all in MicroPython on a Raspberry Pi Pico.',
        ],
      },
    ],
  },
  {
    id: 'animaldot',
    executable: 'animaldot',
    title: 'AnimalDot Smart Bed',
    tagline: 'Contactless animal vital-signs monitoring bed, embedded-to-mobile',
    period: 'August 2025 – May 2026',
    location: 'Capstone Design',
    objectLabel: 'Dog',
    accentColor: '#4ecdc4',
    description: [
      "AnimalDot is a pet bed that reads a dog's heart rate and breathing without ever touching them. A geophone in the frame picks up the tiny vibrations a body makes just by resting, and the firmware pulls a heartbeat out of that noise.",
      'I wrote all of the software (36 of 37 commits across the team repo). The firmware pulls a heartbeat out of geophone noise with a zero-phase Butterworth band-pass, motion rejection, and trimmed-mean beat timing at 200 Hz, then streams it out over Bluetooth and MQTT with captive-portal WiFi setup.',
      'It ends up everywhere: a native SwiftUI iOS app, a React Native app that fails over from Bluetooth to MQTT to the cloud, and an Express/Postgres backend that re-runs the same DSP server-side, with about 53 tests and two CI pipelines across the monorepo.',
    ],
    techStack: ['ESP32', 'C++ (PlatformIO)', 'NimBLE / BLE', 'MQTT', 'DSP', 'SwiftUI', 'React Native', 'Express', 'PostgreSQL'],
    additionalProjects: [
      {
        title: 'BreakBuddy',
        period: 'August 2025 – December 2025',
        description: [
          'BreakBuddy is a guilt-free break app for teachers. It turns a spare two to five minutes into a guided micro-break, with just enough of a social nudge to make it stick.',
          'I designed it the proper UX way: interviews, affinity mapping, and framing the real problem before drawing a single screen, then testing paper and high-fidelity prototypes.',
          "The result has a forgiving timer, thoughtful error states, and a reports dashboard that tracks streaks without making you feel bad about missing one.",
        ],
      },
    ],
  },
  {
    id: 'kitchen-chaos-vr',
    executable: 'kitchenchaos',
    title: 'Kitchen Chaos VR',
    tagline: 'Immersive multiplayer VR experiences on Quest 3',
    period: 'October 2025 – December 2025',
    location: 'Virtual Reality, CSCI 6830',
    objectLabel: 'Quest 3',
    accentColor: '#a855f7',
    github: 'https://github.com/jke48222/VR-Final-Project',
    description: [
      'Kitchen Chaos is Overcooked in VR, a co-op cooking game for the Meta Quest 3 where you and a friend scramble to plate dishes before the timer (and the chaos) catches up with you.',
      "Everything is physics: you grab, chop, and throw real objects across 133 food prefabs and 8 recipes, while VelNet keeps both players' avatars and every flying ingredient in sync. Built as an equal two-person team.",
      'At the end of each round an AI judge tastes your dish, scores it, and roasts (or praises) you out loud with text-to-speech and all.',
    ],
    techStack: ['Unity3D', 'C#', 'Meta Quest 3', 'VelNet', 'OpenXR', 'Meta XR SDK', 'REST APIs'],
    additionalProjects: [
      {
        title: 'VR Portfolio 2',
        period: 'October 2025 – November 2025',
        github: 'https://github.com/jke48222/VR-Portfolio-2',
        description: [
          'Two polished XR experiences for the Meta Quest 3: a VR mini-museum you walk through, and a mixed-reality room where digital objects share your actual space.',
          'It leans on the harder parts of XR: hand tracking, passthrough, objects that hide behind your real furniture, and grabbing things from across the room.',
          "There's also an AI assistant you can just talk to: it understands natural speech, answers out loud, and moves its mouth while it does.",
        ],
      },
      {
        title: 'VR Portfolio 1',
        period: 'August 2025 – October 2025',
        github: 'https://github.com/jke48222/VR-Portfolio-1',
        description: [
          'Four small VR worlds for the Meta Quest 3, each built to nail one fundamental: moving objects, real physics, a sense of presence, and natural interaction.',
          'It was where I learned VR by building it. Across a stack of C# scripts I worked through lighting, spatial audio, collision, and smooth locomotion, turning textbook concepts into things you can actually pick up and play.',
        ],
      },
    ],
  },
  {
    id: 'memesat',
    executable: 'memesat',
    title: 'MEMESat-1 Flight Software',
    tagline: 'Embedded C/C++ flight software for a 2U CubeSat on STM32 microcontrollers.',
    period: 'March 2024 – December 2024',
    location: 'Small Satellite Research Laboratory (SSRL)',
    objectLabel: 'CubeSat',
    accentColor: '#06b6d4',
    description: [
      'MEMESat-1 is a 2U CubeSat, a small satellite built to actually fly. I worked on the flight software that runs it, written in C/C++ on STM32 microcontrollers.',
      'A lot of the job was the careful, unglamorous kind of engineering that space demands: bringing up and debugging the UART links between the satellite\'s subsystems, and writing the tests that prove the software won\'t fall over in orbit when something unexpected happens.',
      "I also reviewed teammates' code and docs to keep the whole codebase consistent and readable, because in flight software the boring details are the mission.",
    ],
    techStack: ['C', 'C++', 'STM32', 'UART', 'Embedded Systems', 'Unit Testing'],
    additionalProjects: [
      {
        title: 'Website Development',
        period: 'September 2022 – May 2024',
        description: [
          'Across two years I designed and ran the web presence for a student engineering organization, building it in WordPress and JavaScript and growing it past 500 visitors a month.',
          'Most of the work was working with people: pulling requirements out of a dozen stakeholders and applying solid UX so the site worked well everywhere.',
        ],
      },
      {
        title: 'Travel Itinerary Application',
        period: 'December 2023',
        description: [
          'A desktop app that builds you a travel plan by pulling in hotels, attractions, and restaurants from live APIs and assembling an itinerary.',
          'Built in JavaFX, with background threading so the interface stays smooth while it\'s busy fetching data.',
        ],
      },
    ],
  },
  {
    id: 'capital-one',
    executable: 'capitalone',
    title: 'Capital One Internship',
    tagline: 'Business Analyst - CreditWise 60M+ users',
    period: 'June 2025 – August 2025',
    location: 'McLean, VA',
    objectLabel: 'Capital One',
    accentColor: '#ef4444',
    description: [
      'As a Business Analyst intern on CreditWise, I built the business case for a new Notifications Preferences Center, a way for 60M+ users to control how the product talks to them.',
      'I dug into how the email campaigns were actually performing, built a framework to put a dollar value on engagement, and pitched the recommendation to senior leaders.',
      'It was equal parts analysis and storytelling. I backed the pitch with SQL, Python, and Excel, then made the case in the room.',
    ],
    techStack: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Business Analysis', 'Product Strategy'],
  },
];

export function getBootSequence(): string[] {
  const lines = [
    'EDUSEI IDE v3.026',
    'Restoring workspace...',
    'Indexing 5 project files...',
    'Workspace ready.',
    '',
    'Open a file from the explorer, or type a command in the terminal.',
  ];
  if (typeof window !== 'undefined' && profileData.birthday) {
    const now = new Date();
    const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (mmdd === profileData.birthday) {
      lines.splice(1, 0, 'Happy birthday, Jalen!');
    }
  }
  return lines;
}

export const asciiArt = `
+------------------------------------------------------------+
|                                                            |
|    EEEEE  DDDD   U   U  SSSS  EEEEE  IIIII                 |
|    E      D   D  U   U  S     E        I                   |
|    EEE    D   D  U   U  SSS   EEE      I                   |
|    E      D   D  U   U     S  E        I                   |
|    EEEEE  DDDD    UUU   SSSS  EEEEE  IIIII                 |
|                                                            |
|    WORKSTATION                      [SOFTWARE ENGINEER]    |
|                                                            |
+------------------------------------------------------------+
`;

export const getProjectById = (id: ViewState): ProjectData | undefined => {
  return projectsData.find(project => project.id === id);
};

export const RELATED_TITLE_TO_SLUG: Record<string, string> = {
  'AnimalDot': 'animaldot',
  'AnimalDot Smart Bed': 'animaldot',
  'AnimalDot Smart Bed (Senior Capstone)': 'animaldot',
  'Personal Portfolio Website': 'personal-portfolio',
  'Musical Artist Website': 'musical-artist-site',
  'Musical Artist Website and Storefront': 'musical-artist-site',
  'Akilah Mali: Musical Artist Website': 'musical-artist-site',
  'Freight Carrier Website': 'freight-carrier-website',
  'KUL Enterprises: Freight Carrier Marketing Website': 'freight-carrier-website',
  'Freight Carrier Operations Portal': 'freight-operations-portal',
  'KUL Enterprises: Broker Credit-Vetting Operations Portal': 'freight-operations-portal',
  'Live Election Platform': 'live-election-platform',
  'NSBE UGA Live Election Platform': 'live-election-platform',
  'Live Election Platform for a Campus Engineering Organization': 'live-election-platform',
  'Relay: Order Management & Fulfillment': 'relay-oms',
  'Relay: Order Management & Fulfillment Console': 'relay-oms',
  'Exocortex': 'exocortex',
  'Exocortex: Local-First Personal Memory System': 'exocortex',
  'WindowPet': 'windowpet',
  'WindowPet: Desktop Creature & Agentic Assistant for macOS': 'windowpet',
  'WindowPet: Desktop Creature & AI Assistant': 'windowpet',
  'Screen-Coach AI': 'screen-coach',
  'QR Worlds': 'qr-worlds',
  'QR Worlds: Every URL Is a Place': 'qr-worlds',
  'Album-Art LED Matrix Wall': 'album-art-matrix',
  'Damage-Claim Evidence Verifier': 'damage-claim-verifier',
  'Damage-Claim Evidence Verifier (HackerRank Orchestrate Hackathon)': 'damage-claim-verifier',
  'Quantitative Paper-Trading Research Harness': 'paper-trading-harness',
  'Ashfall: The Last Hours of Pompeii': 'ashfall',
  'PrimeForge FPGA Prime Number Detector': 'primeforge-fpga',
  'PrimeForge: FPGA Prime-Finding Engine': 'primeforge-fpga',
  'PARMCO Bluetooth Motor Control System': 'parmco-ble-motor',
  'PARMCO: Bluetooth Motor Control System': 'parmco-ble-motor',
  'Übersicht Desktop Widget Suite': 'ubersicht-widgets',
  'PDMS Microfluidic Mixer': 'pdms-microfluidic-mixer',
  'Kitchen Chaos VR': 'kitchen-chaos-vr',
  'BreakBuddy': 'break-buddy',
  'VR Portfolio 2': 'vr-portfolio-2',
  'Virtual Reality Portfolio 2': 'vr-portfolio-2',
  'XR Portfolio 2: VR Mini Museum & Mixed-Reality Room': 'vr-portfolio-2',
  'Smart Plant Watering Assistant': 'smart-plant-watering-assistant',
  'Smart Plant Assistant': 'smart-plant-watering-assistant',
  'VR Portfolio 1': 'vr-portfolio-1',
  'Virtual Reality Portfolio 1': 'vr-portfolio-1',
  'XR Portfolio 1: Four Unity Demos': 'vr-portfolio-1',
  'Audio Tracking Car': 'audio-tracking-car',
  'LED Frequency Filter': 'led-frequency-filter',
  'MEMESat-1 Flight Software': 'memesat',
  'Website Development': 'website-development',
  'Creation and Development of Websites': 'website-development',
  'Student Organization Websites': 'website-development',
  'Travel Itinerary Application': 'travel-itinerary-application',
  'Capital One Internship': 'capital-one',
};

/**
 * Tile media for the future redesign's Selected Work cards.
 * Each project carries one of:
 *  - 'model': a local 3D model (glb/gltf) for hardware/embedded/VR projects, rendered in an
 *    interactive viewer inside the tile.
 *  - 'site': a live URL rendered as an interactive iframe preview inside the tile.
 *  - 'image': a static fallback image for projects without a model or live preview.
 *
 * Currently unused by renderers — populated now so the redesign is a presentation swap.
 */
export type TileMedia =
  /**
   * Interactive 3D model (glb/gltf) rendered in a mini-viewer. `rotation` (radians, XYZ)
   * corrects models that are authored lying down so they stand upright.
   */
  | { kind: 'model'; src: string; alt: string; rotation?: [number, number, number] }
  /**
   * A real website. `embed: true` renders a live, scaled iframe preview (only for sites
   * that allow framing). `embed: false` renders a "browser card" with chrome + an optional
   * screenshot (use for sites that block embedding via X-Frame-Options/CSP, or to avoid
   * self-recursion). `screenshot` is an optional /public image path.
   */
  | { kind: 'site'; url: string; embed?: boolean; screenshot?: string }
  /** Static screenshot/image. */
  | { kind: 'image'; src: string; alt: string }
  /** Looping video preview (e.g. a hardware demo). `poster` is shown before play. */
  | { kind: 'video'; src: string; poster?: string; alt: string }
  /** Animated dot-matrix spinning globe (canvas). */
  | { kind: 'globe' };

/** Coarse project taxonomy used by the future redesign for tile layout decisions. */
export type ProjectCategory = 'web' | 'embedded' | 'vr' | 'hardware' | 'research' | 'ai';

export interface WorkProject {
  id: string;
  title: string;
  /** Optional compact title for cramped tile spaces. */
  shortTitle?: string;
  tagline: string;
  description: string[];
  techStack: string[];
  period: string;
  location: string;
  github?: string;
  /** Production URL for the "View live" button on the detail page. */
  liveUrl?: string;
  /** Tile background medium for the future redesign (3D model, live site, or image). */
  tileMedia?: TileMedia;
  /** Project category — informs tile presentation and filtering. */
  category?: ProjectCategory;
  /** Real screenshots (e.g. pulled from a GitHub README) shown as a gallery on the detail page. */
  gallery?: { src: string; alt: string }[];
  /** YouTube demo videos shown as an embedded "Demos" section on the detail page. */
  demos?: { title: string; youtubeId: string }[];
  additionalProjects?: { title: string; period: string; github?: string; description: string[] }[];
  relatedProjects?: { title: string; slug: string; period: string }[];
}

/** Raw GitHub content base for jke48222 (used to surface real README screenshots). */
const GH_RAW = 'https://raw.githubusercontent.com/jke48222';

/**
 * Standalone projects from the CV that are not tied to a 3D workstation object.
 * These flow into the /work listing and (when listed in FEATURED_IDS) the
 * "Selected Work" cards on the professional view.
 */
const extraProjects: WorkProject[] = [
  {
    id: 'exocortex',
    title: 'Exocortex: Local-First Personal Memory System',
    shortTitle: 'Exocortex',
    tagline: 'A local-first memory system that gives AI tools one private, shared memory.',
    period: 'August 2026 – Present',
    location: 'Personal project (private repo)',
    category: 'ai',
    techStack: ['Swift', 'SQLite / FTS5', 'MLX', 'Qwen3-Embedding', 'Apple Foundation Models', 'MCP', 'Python'],
    description: [
      "Exocortex is my attempt at a second brain that actually belongs to me. Fourteen streams of my digital life (messages, browsing, email, AI transcripts, phone backups) flow into one local 100,000-event store on my machine, with secret redaction, trust-class retention, and encrypted, restore-verified backups. Nothing leaves it.",
      "Search is the heart: keyword search fused with a binary vector index over embeddings generated on-device. In a controlled test it found the right memory 19 times out of 20, where keywords alone managed 11. I published the miss, and retracted an earlier, better-looking number when I realized its ground truth was circular.",
      "AI tools plug in through an MCP server with real guardrails: per-client trust tiers, no bulk-read primitive, sanitization against link-based exfiltration, canary rows, and a hash-chained audit log. A nightly 'dream' pipeline finds contradictions, tracks commitments, and writes me a weekly narrative, with every model output citation-checked in code.",
    ],
    relatedProjects: [
      { title: 'WindowPet', slug: 'windowpet', period: 'August 2026 – Present' },
      { title: 'Screen-Coach AI', slug: 'screen-coach', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'windowpet',
    title: 'WindowPet: Desktop Creature & AI Assistant',
    shortTitle: 'WindowPet',
    tagline: 'A creature that lives on your real macOS windows, with an agentic AI brain.',
    period: 'August 2026 – Present',
    location: 'Personal project (private repo)',
    category: 'ai',
    techStack: ['Swift', 'AppKit', 'Core Animation', 'macOS Accessibility API', 'Anthropic Messages API', 'XCTest'],
    description: [
      "WindowPet is a little creature that stands on your actual windows: it rides them while you drag, falls when you close one, and leaps between them with a physics solver tested to a point and a half. It reads window geometry through APIs that never trigger a screen-recording prompt, because a desktop pet should not be spyware.",
      "Talk to it and there's a three-tier assistant underneath: an exact command grammar, an agentic Claude loop written directly against the Messages API (streaming, JSON-schema tool calls, vision), and an on-device fallback. Every action funnels through one confirmation gate, so nothing destructive happens without a yes.",
      "It ships as a signed app with a DMG installer, four procedurally generated skins plus a Shimeji importer for third-party art, 131 unit tests, a 93-check self-driving end-to-end rig, and an energy benchmark that keeps it at about a quarter percent of CPU while it sleeps.",
    ],
    relatedProjects: [
      { title: 'Exocortex', slug: 'exocortex', period: 'August 2026 – Present' },
      { title: 'Screen-Coach AI', slug: 'screen-coach', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'screen-coach',
    title: 'Screen-Coach AI',
    tagline: 'An assistant that points at the exact button and teaches software step by step.',
    period: 'August 2026 – Present',
    location: 'Personal project',
    category: 'ai',
    techStack: ['Swift', 'AppKit', 'macOS Accessibility API', 'ScreenCaptureKit', 'MLX', 'Holo1.5-7B', 'XCTest'],
    description: [
      "Ask 'where do I turn on dark mode?' and a cursor glides to the exact control. Screen-Coach grounds on the macOS accessibility tree first. On a cooperating app it answered 12 of 12 targets in under a tenth of a millisecond, and it only wakes a locally quantized 7-billion-parameter vision model when the tree can't answer.",
      "I benchmarked before I built: cold accessibility reads ran up to ten times slower than warm ones and decayed within seconds, so a speculative cache became the architecture, and using the tree to aim a small screenshot crop matched full-image vision accuracy at three times the speed.",
      "It is honest about confidence, since only agreement between tree and vision earns a solid pointer ring, and it is private by construction: a hot-reloading blocklist stops both capture and tree reads for excluded apps, added after I caught the tree alone leaking message content. Ninety-six headless tests; about 0.05% CPU at idle.",
    ],
    relatedProjects: [
      { title: 'WindowPet', slug: 'windowpet', period: 'August 2026 – Present' },
      { title: 'Exocortex', slug: 'exocortex', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'personal-portfolio',
    title: 'Personal Portfolio Website',
    tagline: 'A scroll-scrubbed video landing page that opens into an explorable 3D workstation.',
    period: 'January 2026 – Present',
    location: 'Atlanta, GA',
    github: 'https://github.com/jke48222/edusei-workstation',
    liveUrl: 'https://www.jalenedusei.com',
    category: 'web',
    techStack: ['React', 'TypeScript', 'Vite', 'React Three Fiber', 'Framer Motion', 'Zustand', 'Tailwind CSS', 'PWA', 'Vercel'],
    description: [
      "This is the site you're looking at. The home page is a scroll-scrubbed video I drive frame by frame with requestAnimationFrame, no scroll library, and behind it sits a full 3D workstation you can explore, complete with a retro CRT terminal.",
      "Under the hood it's React Three Fiber for the 3D, Framer Motion for the transitions, and a small theme engine of about two dozen presets shared by the 3D scene and the UI. It ships as a PWA with service-worker caching, lazy routes, and a render loop that pauses when it isn't needed.",
      "I designed it, built it, and shipped it on Vercel. Start to finish, it's all mine.",
    ],
    relatedProjects: [
      { title: 'Freight Carrier Website', slug: 'freight-carrier-website', period: 'June 2026 – Present' },
      { title: 'Musical Artist Website', slug: 'musical-artist-site', period: 'May 2026 – Present' },
      { title: 'QR Worlds', slug: 'qr-worlds', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'freight-carrier-website',
    title: 'Freight Carrier Website',
    shortTitle: 'Freight Carrier Site',
    tagline: 'Production Next.js site with a git-backed CMS and a token design system for KUL Enterprises.',
    period: 'June 2026 – Present',
    location: 'Freelance client work',
    category: 'web',
    liveUrl: 'https://www.kulenterprises.com',
    github: 'https://github.com/jke48222/kul-enterprises-website',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'TinaCMS', 'Tailwind CSS v4', 'Framer Motion', 'Resend', 'Vercel'],
    description: [
      "A production website for KUL Enterprises, an independent Georgia freight carrier, with me as the whole team: design, engineering, and shipping. We iterated twelve design directions, built out as twenty working variants, before landing the one that fit, then shipped 22 statically generated pages across services, driver recruiting, safety, quoting, and legal.",
      "The rule underneath it all: no readable sentence ships hardcoded. Every page, service, FAQ, form, and legal document lives in a typed, git-backed TinaCMS collection, a token system fills shared business facts into any sentence, and a custom build wrapper means a broken CMS edit can never take the site down.",
      "The motion starts with a brand film I produced in Blender and Higgsfield and cut in Final Cut Pro, shipped as H.264 with a quality ladder after I documented an iOS Safari codec failure the hard way. Site search scores the CMS content directly so results never go stale, four forms submit through rate-limited, honeypot-protected routes, and every color token carries a measured WCAG AA contrast ratio.",
    ],
    relatedProjects: [
      { title: 'Freight Carrier Operations Portal', slug: 'freight-operations-portal', period: 'August 2026 – Present' },
      { title: 'Musical Artist Website', slug: 'musical-artist-site', period: 'May 2026 – Present' },
    ],
  },
  {
    id: 'freight-operations-portal',
    title: 'Freight Carrier Operations Portal',
    shortTitle: 'Operations Portal',
    tagline: 'Role-based broker credit vetting for the same carrier, with the rules living in Postgres.',
    period: 'August 2026 – Present',
    location: 'Freelance client work (private repo)',
    category: 'web',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Supabase', 'PostgreSQL', 'Vercel'],
    description: [
      "When a broker calls a carrier with a load, someone has to decide fast whether that broker can be trusted with the truck. This portal turns KUL's screening process into software: a broker database that refuses duplicate MC numbers, their twelve vetting questions with FMCSA records linked in, and a green/yellow/red rating where red sets a do-not-load block only an administrator can clear, reason recorded.",
      "The compliance rules live in Postgres itself, not the app: row-level security by role, an audit log the application can only read, screenings that snapshot their exact question wording, and atomic SQL functions for every state change. Four staff roles, invite-only, no self-signup.",
    ],
    relatedProjects: [
      { title: 'Freight Carrier Website', slug: 'freight-carrier-website', period: 'June 2026 – Present' },
    ],
  },
  {
    id: 'musical-artist-site',
    title: 'Musical Artist Website',
    tagline: 'A recording artist\'s home on the web: real-time 3D, a working payphone, zero backend to babysit.',
    period: 'May 2026 – Present',
    location: 'Freelance client work',
    category: 'web',
    github: 'https://github.com/jke48222/akilahmali',
    liveUrl: 'https://www.akilahmali.com',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'three.js', 'React Three Fiber', 'GSAP', 'Web Audio API', 'Vercel'],
    description: [
      "A home base for recording artist Akilah Mali, somewhere fans can listen, watch, and dig around. The centerpiece is a real-time 3D 'control room' with CCTV-style feeds, and there's a rotary payphone you can actually dial, built on the Web Audio API.",
      "It's deliberately backend-free: music and tour dates come through embeds, email capture goes to Laylo, and the shop hands off to Shopify's hosted storefront. I built a full headless Shopify cart first, with httpOnly cookie sessions and server-side mutations, then removed it after a security review, because the simpler architecture was the better product.",
      "The heavy 3D pays for itself: three.js is code-split off the release pages and the WebGL mount waits behind an instant paper cover, which cut about 46 MB off the initial load.",
    ],
    relatedProjects: [
      { title: 'Freight Carrier Website', slug: 'freight-carrier-website', period: 'June 2026 – Present' },
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
    ],
  },
  {
    id: 'relay-oms',
    title: 'Relay: Order Management & Fulfillment',
    shortTitle: 'Relay OMS',
    tagline: 'An event-driven order pipeline that refuses to oversell.',
    period: 'July 2026',
    location: 'Personal project (private repo)',
    category: 'web',
    techStack: ['Elixir', 'Phoenix', 'Ecto', 'PostgreSQL', 'Phoenix Channels', 'React 19', 'TypeScript', 'Docker', 'Kubernetes'],
    description: [
      "Relay is a miniature production backend: orders arrive over a JSON API, an event-driven pipeline allocates inventory across four fulfillment centers, and each order walks from received to delivered while a React console watches it all happen live over websockets.",
      "The interesting parts are the failure modes. Every state change and its event commit in one transaction (a Kafka-style outbox), allocation runs under row locks with a database constraint as the backstop so two orders can't both take the last unit, and the worker rehydrates from the database on boot so a restart strands nothing.",
      "Fifty-two tests target exactly those failure modes (oversell, partial reservations, illegal transitions, idempotent replays) and run green in GitHub Actions alongside Docker and Kubernetes manifests.",
    ],
    relatedProjects: [
      { title: 'Live Election Platform', slug: 'live-election-platform', period: 'March 2026 – June 2026' },
      { title: 'Freight Carrier Operations Portal', slug: 'freight-operations-portal', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'live-election-platform',
    title: 'Live Election Platform',
    tagline: 'Presenter-paced realtime elections with layered anti-fraud, used for a real chapter election.',
    period: 'March 2026 – June 2026',
    location: 'for a campus engineering student organization',
    category: 'web',
    techStack: ['Next.js 14', 'JavaScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'WebSockets', 'Row-Level Security'],
    description: [
      "When a room full of people needs to vote live, things break in funny ways. Everyone submits at once, someone tries to vote twice, and the presenter loses control of the pace. This system fixes all three, and it ran a real 14-role, 39-candidate chapter election.",
      "It's presenter-paced: the host walks the room through each race, ballots arrive over websockets the moment a poll opens, and a little randomized timing spreads the stampede when voting starts.",
      "Stopping double-votes was the real puzzle: device fingerprinting backed by a database uniqueness constraint, row-level security with anonymous writes revoked, and a dues-roster gate at check-in. Before election night I ran a 29-finding security audit and confirmed the fixes with 42 HTTP-level tests; afterwards I started a multi-tenant rewrite on self-hosted Postgres.",
    ],
    relatedProjects: [
      { title: 'Relay: Order Management & Fulfillment', slug: 'relay-oms', period: 'July 2026' },
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
    ],
  },
  {
    id: 'qr-worlds',
    title: 'QR Worlds',
    tagline: 'Type any URL and watch it become a scannable little planet.',
    period: 'August 2026 – Present',
    location: 'Personal project',
    category: 'web',
    techStack: ['TypeScript', 'three.js', 'GLSL', 'Vite', 'Vitest'],
    description: [
      "QR Worlds turns any web address into a place: the URL's QR code becomes a floating voxel ground, and the address itself deterministically grows the planet above it: colors, rings, moons, and clouds. Type a character and thousands of instanced voxels rebuild in three draw calls, in single-digit milliseconds.",
      "Determinism is guaranteed the hard way: integer-only randomness (V8 and Safari disagree in the last bits of floating point), double-hashed seeding, and a separate random stream per subsystem so adding a feature can't shift anyone's existing world.",
      "And the code still scans. A test projects every QR module through the live camera and checks the rendered pixels against the encoder's grid: at most 1.3% misread and 8% occluded, inside the error-correction budget, after I deepened a ground color that looked dark but measured 1.8:1 contrast.",
    ],
    relatedProjects: [
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
      { title: 'Übersicht Desktop Widget Suite', slug: 'ubersicht-widgets', period: 'May 2026' },
    ],
  },
  {
    id: 'album-art-matrix',
    title: 'Album-Art LED Matrix Wall',
    shortTitle: 'LED Matrix Wall',
    tagline: 'A 9-panel LED wall that shows whatever is playing as a spinning disc.',
    period: 'August 2026 – Present',
    location: 'Personal project (private repo)',
    category: 'hardware',
    techStack: ['Python', 'C', 'MicroPython', 'Raspberry Pi 5', 'HUB75', 'KiCad', 'ngspice', 'systemd'],
    description: [
      "A wall of nine LED matrix panels that knows what's playing: the current album cover renders as a spinning disc, driven by a Raspberry Pi 5 and a chain of now-playing adapters for Apple Music, with more sources staged behind it.",
      "Color is the craft here. The art pipeline downscales with Lanczos sharpening, converts to linear light, applies white-balance gains derived from a colorimeter I put on a Pico 2 W and pointed at the panel itself, and spins the disc with 4x supersampling, all feeding a C daemon that refreshes the panels at 9,600 Hz.",
      "I also designed the electronics: a custom two-layer Pi 5 backplane PCB in KiCad, with level shifters and series termination, three fused 12-amp power sections, and a protected power jumper, expressed as code that emits its own netlist and BOM, sized with ngspice simulations, and delivered as fab-ready gerbers. Panels arrived in August; first light is next.",
    ],
    relatedProjects: [
      { title: 'PrimeForge FPGA Prime Number Detector', slug: 'primeforge-fpga', period: 'January 2026 – May 2026' },
      { title: 'AnimalDot Smart Bed', slug: 'animaldot', period: 'August 2025 – May 2026' },
    ],
  },
  {
    id: 'primeforge-fpga',
    title: 'PrimeForge FPGA Prime Number Detector',
    shortTitle: 'PrimeForge FPGA',
    tagline: 'A Verilog prime engine that found all 5,761,455 primes below 100 million on hardware.',
    period: 'January 2026 – May 2026',
    location: 'Advanced Digital Design, CSEE 4280',
    category: 'hardware',
    gallery: [
      { src: '/media/primeforge-monitor.jpg', alt: 'PrimeForge VGA output: self-check and last-20-primes readout' },
      { src: '/media/primeforge-board.jpg', alt: 'Nexys A7 FPGA with PMOD joystick, keypad, and VGA output' },
    ],
    techStack: ['Verilog', 'Artix-7 FPGA', 'Vivado', 'DDR2', 'SD / SPI', 'VGA', 'Icarus Verilog'],
    description: [
      "PrimeForge is a prime-number engine built straight in hardware. No operating system, no processor running C, just 33 Verilog modules across four clock domains on a Nexys A7 doing the math.",
      "Two engines sit under the hood, a segmented Sieve of Eratosthenes and a trial-division core, selectable at runtime from an FSM-driven menu you drive with a joystick and keypad. Every prime streams into DDR2 through a custom two-client arbiter, and a from-scratch VGA pipeline draws the live count, the last twenty primes, and the runtime on screen.",
      "On hardware it found all 5,761,455 primes below 100 million, the exact right answer, and checked itself against an SD-card reference in a lock-step self-test. Twelve self-checking testbenches with behavioral memory and SD models verified the modules along the way.",
    ],
    relatedProjects: [
      { title: 'PARMCO Bluetooth Motor Control System', slug: 'parmco-ble-motor', period: 'January 2026 – May 2026' },
      { title: 'Album-Art LED Matrix Wall', slug: 'album-art-matrix', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'parmco-ble-motor',
    title: 'PARMCO Bluetooth Motor Control System',
    shortTitle: 'PARMCO BLE Motor',
    tagline: 'BLE motor control with a SwiftUI iOS client and closed-loop RPM control.',
    period: 'January 2026 – May 2026',
    location: 'Embedded Systems II, ECSE 4235',
    category: 'embedded',
    liveUrl: 'https://jke48222.github.io/parmco/',
    github: 'https://github.com/jke48222/parmco',
    techStack: ['C', 'BlueZ', 'Raspberry Pi 4', 'BLE', 'SwiftUI', 'Core Bluetooth', 'ARMv7 Assembly', 'pigpio', 'systemd'],
    description: [
      'PARMCO lets you control a physical motor from your iPhone over Bluetooth. Pick a direction, dial in a speed, and watch the live RPM stream back to the app.',
      'The Raspberry Pi runs a Bluetooth server I wrote in C over BlueZ, reaching down to the hardware with ARM assembly over direct register mapping and DMA-timed PWM to actually spin the motor.',
      'It can also hold a target speed on its own: a closed loop counts optical tachometer pulses and trims the power every quarter second, settling to a 4,500 RPM target in about a second. A SwiftUI app ties it together, and a systemd service brings the whole thing back after a power cycle.',
    ],
    relatedProjects: [
      { title: 'PrimeForge FPGA Prime Number Detector', slug: 'primeforge-fpga', period: 'January 2026 – May 2026' },
      { title: 'AnimalDot Smart Bed', slug: 'animaldot', period: 'August 2025 – May 2026' },
    ],
  },
  {
    id: 'ubersicht-widgets',
    title: 'Übersicht Desktop Widget Suite',
    shortTitle: 'Übersicht Widgets',
    tagline: 'Suite of 12 macOS desktop widgets under a unified design system.',
    period: 'May 2026',
    location: 'Personal project',
    category: 'web',
    github: 'https://github.com/jke48222/widget-suite',
    tileMedia: { kind: 'video', src: '/media/ubersicht-home.mp4', poster: '/media/ubersicht-home-poster.jpg', alt: 'Übersicht widget suite running on a macOS desktop' },
    gallery: [
      'animated-wallpaper', 'now-playing', 'spinning-globe', 'daily-astronomy-photo',
      'rotating-3d-model', 'recent-album-covers', 'daily-tarot', 'github-contributions',
      'clipboard-history', 'daily-ai-prompt', 'recent-downloads', 'wallpaper-switcher',
    ].map((n) => ({ src: `${GH_RAW}/widget-suite/main/thumbs/${n}.png`, alt: `${n.replace(/-/g, ' ')} widget` })),
    techStack: ['React', 'JSX', 'WebGL', 'AppleScript', 'Python', 'Claude API', 'Design Systems'],
    description: [
      "Twelve little desktop widgets for macOS that turn an empty desktop into something alive: a now-playing vinyl record, a spinning globe of places I've been, a live shader wallpaper, NASA's photo of the day, a daily AI prompt, and more.",
      'They all share one design system, so twelve separate projects still feel like a set: the same frosted-glass cards, the same type, the same drag-and-resize, and offline fallbacks so nothing looks broken when the wifi drops.',
      'Each one ships as its own GitHub repo with a one-line install script. I actually prototyped the whole suite as a native Swift WidgetKit app first, then chose Übersicht for the continuous animation WidgetKit doesn\'t allow.',
    ],
    relatedProjects: [
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
      { title: 'QR Worlds', slug: 'qr-worlds', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'damage-claim-verifier',
    title: 'Damage-Claim Evidence Verifier',
    shortTitle: 'Claim Verifier',
    tagline: 'A 24-hour hackathon build that reads claim photos and catches prompt injection.',
    period: 'June 2026',
    location: 'HackerRank Orchestrate hackathon (solo)',
    category: 'ai',
    techStack: ['Python', 'Anthropic Messages API', 'JSON-Schema Tool Use', 'Pydantic', 'unittest'],
    description: [
      "A 24-hour solo hackathon build: given claim photos, chat transcripts, and user history for damaged cars, laptops, and packages, decide whether the evidence supports the claim, and output a strict 14-field verdict for all 44 test claims, every time, even when API calls fail.",
      "The design principle was 'the model does vision, code does bookkeeping': a deterministic layer normalizes the model's answers, applies the risk rules, and routes edge cases to review, which lifted exact-row accuracy from 65% to 100% on the labeled sample.",
      "It also caught all seven adversarial claims, sticky notes in photos saying 'approve this claim', flagging them without letting them flip the verdict, and shipped with 13 unit tests including a machine-checked guard against hardcoded answers.",
    ],
    relatedProjects: [
      { title: 'Exocortex', slug: 'exocortex', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'paper-trading-harness',
    title: 'Quantitative Paper-Trading Harness',
    shortTitle: 'Trading Harness',
    tagline: 'A research harness whose whole job is to reject its own trading ideas properly.',
    period: 'July 2026 – Present',
    location: 'Personal project',
    category: 'research',
    techStack: ['TypeScript', 'Node.js', 'Binance API', 'Alpaca Paper API', 'Pine Script', 'launchd'],
    description: [
      "A strict-TypeScript harness (zero runtime dependencies) that backtests and forward-tests systematic strategies on paper accounts, built above all to not fool me. Every idea is pre-registered in an append-only trial ledger before it runs.",
      "Across seven trials and 114 logged runs, the statistics did their job: realistic costs, drift benchmarks, and a 10,000-resample bootstrap with multiple-testing correction rejected every single-asset strategy I tried. The one effect that survived stays frozen until it proves itself out-of-sample.",
      "It has run unattended for over five weeks through launchd agents with a deadman health check and zero heartbeat failures, logging measured slippage on every paper order. Simulation only; there is no live order path in the codebase.",
    ],
  },
  {
    id: 'ashfall',
    title: 'Ashfall: The Last Hours of Pompeii',
    shortTitle: 'Ashfall',
    tagline: 'A UE5 vertical slice where you toggle Pompeii between its golden age and its final hours.',
    period: 'June 2026',
    location: 'Personal project (private repo)',
    category: 'vr',
    techStack: ['Unreal Engine 5.8', 'C++', 'Lumen', 'Nanite', 'Python', 'three.js'],
    description: [
      "Ashfall is a time-travel puzzle prototype set hours before Vesuvius: every street can flip between its living 'Zenith' and its buried 'Fall', and changing the past is how you save people.",
      "I built the C++ framework that makes that work in Unreal Engine 5.8: a world subsystem as the single source of truth, per-actor temporal components that morph geometry, materials, and physics, a lighting director that cross-fades the whole scene's mood, and causal flags so interventions persist across toggles.",
      "A Python asset pipeline pulls only license-clean assets with provenance manifests and builds the entire level procedurally; headless assertion suites (32 checks, all passing) verify the slice on macOS, and the same scene runs in the browser through a three.js port.",
    ],
    relatedProjects: [
      { title: 'Kitchen Chaos VR', slug: 'kitchen-chaos-vr', period: 'October 2025 – December 2025' },
    ],
  },
  {
    id: 'pdms-microfluidic-mixer',
    title: 'PDMS Microfluidic Mixer',
    shortTitle: 'PDMS Mixer',
    tagline: 'Passive microfluidic mixers fabricated in PDMS via soft lithography.',
    period: 'January 2026 – May 2026',
    location: 'Microfabrication',
    category: 'research',
    techStack: ['PDMS', 'Photolithography', 'Soft Lithography', 'Cleanroom', 'Microfluidics'],
    description: [
      'At a small enough scale, liquids refuse to mix and just flow side by side. This project is a set of tiny channels, etched into a rubbery polymer, designed to force two fluids to fold into each other anyway.',
      'I made them in a cleanroom: patterning molds with UV light and photoresist, then casting and bonding the PDMS chips by hand. Three channel shapes went head-to-head to see which mixed best.',
      "Then we tested them on a syringe pump across a range of flow rates, photographing each junction under a microscope to see what worked and diagnosing the dust specks and leaks that didn't.",
    ],
  },
];

/**
 * Slugs of the curated projects surfaced as "Selected Work" cards on the
 * professional view and the Timeline. Decoupled from the 3D workstation
 * objects (which remain the five projectsData entries). Order is the display order.
 */
export const FEATURED_IDS = [
  'exocortex',
  'windowpet',
  'freight-carrier-website',
  'musical-artist-site',
  'relay-oms',
  'freight-operations-portal',
  'live-election-platform',
  'animaldot',
  'album-art-matrix',
  'primeforge-fpga',
  'kitchen-chaos-vr',
  'memesat',
] as const;

/** Fail fast with a named error — a bare non-null assertion would surface a renamed
 *  id as a cryptic "cannot read properties of undefined" far from the cause. */
function mustFind(id: string) {
  const p = projectsData.find((x) => x.id === id);
  if (!p) throw new Error(`data/index.ts: core project '${id}' missing from projectsData`);
  return p;
}

function buildCoreProjects(): WorkProject[] {
  const list: WorkProject[] = [];

  const defaultLocation = 'Athens, GA';

  const animaldot = mustFind('animaldot');
  const kitchen = mustFind('kitchen-chaos-vr');
  const audioCar = mustFind('audio-tracking-car');
  const memesat = mustFind('memesat');
  const capital = mustFind('capital-one');

  list.push({
    id: animaldot.id,
    title: animaldot.title,
    tagline: animaldot.tagline,
    description: animaldot.description,
    techStack: animaldot.techStack,
    period: animaldot.period,
    location: animaldot.location,
    github: animaldot.github,
    additionalProjects: animaldot.additionalProjects,
  });
  list.push({
    id: kitchen.id,
    title: kitchen.title,
    tagline: kitchen.tagline,
    description: kitchen.description,
    techStack: kitchen.techStack,
    period: kitchen.period,
    location: kitchen.location,
    github: kitchen.github,
    additionalProjects: kitchen.additionalProjects,
  });
  const breakBuddy = animaldot.additionalProjects?.find(a => a.title === 'BreakBuddy');
  if (breakBuddy) {
    list.push({
      id: 'break-buddy',
      title: breakBuddy.title,
      tagline: breakBuddy.description[0] ?? breakBuddy.title,
      description: breakBuddy.description,
      techStack: ['User Research', 'Figma', 'HCI', 'Prototyping'],
      period: breakBuddy.period,
      location: defaultLocation,
      github: breakBuddy.github,
      relatedProjects: [{ title: 'AnimalDot', slug: 'animaldot', period: animaldot.period }],
    });
  }
  const vr2 = kitchen.additionalProjects?.find(a => a.title === 'VR Portfolio 2');
  if (vr2) {
    list.push({
      id: 'vr-portfolio-2',
      title: 'Virtual Reality Portfolio 2',
      tagline: vr2.description[0] ?? vr2.title,
      description: vr2.description,
      techStack: ['Unity', 'C#', 'Meta Quest 3', 'OpenXR', 'Wit.ai'],
      period: vr2.period,
      location: defaultLocation,
      github: vr2.github,
      relatedProjects: [
        { title: 'Kitchen Chaos VR', slug: 'kitchen-chaos-vr', period: kitchen.period },
        { title: 'Virtual Reality Portfolio 1', slug: 'vr-portfolio-1', period: (kitchen.additionalProjects?.find(a => a.title === 'VR Portfolio 1'))?.period ?? '' },
      ],
    });
  }
  const smartPlant = audioCar.additionalProjects?.find(a => a.title === 'Smart Plant Watering Assistant');
  if (smartPlant) {
    list.push({
      id: 'smart-plant-watering-assistant',
      title: smartPlant.title,
      tagline: smartPlant.description[0] ?? smartPlant.title,
      description: smartPlant.description,
      techStack: ['Raspberry Pi Pico', 'MicroPython', 'Kalman Filtering', 'Signal Conditioning'],
      period: smartPlant.period,
      location: defaultLocation,
      github: smartPlant.github,
      relatedProjects: [{ title: 'Audio Tracking Car', slug: 'audio-tracking-car', period: audioCar.period }],
    });
  }
  const vr1 = kitchen.additionalProjects?.find(a => a.title === 'VR Portfolio 1');
  if (vr1) {
    list.push({
      id: 'vr-portfolio-1',
      title: 'Virtual Reality Portfolio 1',
      tagline: vr1.description[0] ?? vr1.title,
      description: vr1.description,
      techStack: ['Unity', 'C#', 'VR', 'Spatial Audio'],
      period: vr1.period,
      location: defaultLocation,
      github: vr1.github,
      relatedProjects: [
        { title: 'Kitchen Chaos VR', slug: 'kitchen-chaos-vr', period: kitchen.period },
        { title: 'Virtual Reality Portfolio 2', slug: 'vr-portfolio-2', period: (kitchen.additionalProjects?.find(a => a.title === 'VR Portfolio 2'))?.period ?? '' },
      ],
    });
  }
  list.push({
    id: audioCar.id,
    title: audioCar.title,
    tagline: audioCar.tagline,
    description: audioCar.description,
    techStack: audioCar.techStack,
    period: audioCar.period,
    location: audioCar.location,
    github: audioCar.github,
    additionalProjects: audioCar.additionalProjects,
  });
  const ledFilter = audioCar.additionalProjects?.find(a => a.title === 'LED Frequency Filter');
  if (ledFilter) {
    list.push({
      id: 'led-frequency-filter',
      title: ledFilter.title,
      tagline: ledFilter.description[0] ?? ledFilter.title,
      description: ledFilter.description,
      techStack: ['Analog Filters', 'Op-Amps', 'Multisim'],
      period: ledFilter.period,
      location: defaultLocation,
      github: ledFilter.github,
      relatedProjects: [
        { title: 'Audio Tracking Car', slug: 'audio-tracking-car', period: audioCar.period },
        { title: 'Smart Plant Watering Assistant', slug: 'smart-plant-watering-assistant', period: smartPlant?.period ?? '' },
      ],
    });
  }
  list.push({
    id: memesat.id,
    title: 'MEMESat-1 Flight Software',
    tagline: memesat.tagline,
    description: memesat.description,
    techStack: memesat.techStack,
    period: memesat.period,
    location: memesat.location,
    github: memesat.github,
    additionalProjects: memesat.additionalProjects,
  });
  const websites = memesat.additionalProjects?.find(a => a.title === 'Website Development');
  if (websites) {
    list.push({
      id: 'website-development',
      title: 'Creation and Development of Websites',
      tagline: websites.description[0] ?? websites.title,
      description: websites.description,
      techStack: ['WordPress', 'JavaScript', 'UX'],
      period: websites.period,
      location: defaultLocation,
      github: websites.github,
      relatedProjects: [
        { title: 'MEMESat-1 Flight Software', slug: 'memesat', period: memesat.period },
        { title: 'Travel Itinerary Application', slug: 'travel-itinerary-application', period: (memesat.additionalProjects?.find(a => a.title === 'Travel Itinerary Application'))?.period ?? '' },
      ],
    });
  }
  const travelApp = memesat.additionalProjects?.find(a => a.title === 'Travel Itinerary Application');
  if (travelApp) {
    list.push({
      id: 'travel-itinerary-application',
      title: travelApp.title,
      tagline: travelApp.description[0] ?? travelApp.title,
      description: travelApp.description,
      techStack: ['JavaFX', 'REST APIs', 'Google Places'],
      period: travelApp.period,
      location: defaultLocation,
      github: travelApp.github,
      relatedProjects: [
        { title: 'MEMESat-1 Flight Software', slug: 'memesat', period: memesat.period },
        { title: 'Creation and Development of Websites', slug: 'website-development', period: websites?.period ?? '' },
      ],
    });
  }
  list.push({
    id: capital.id,
    title: capital.title,
    tagline: capital.tagline,
    description: capital.description,
    techStack: capital.techStack,
    period: capital.period,
    location: capital.location,
    github: capital.github,
  });

  return list;
}

/**
 * Project taxonomy by slug — drives the category icon/badge on tiles and the
 * /work filter chips. Centralized here so derived core projects (built without an
 * explicit category) still get one without editing each push site.
 */
const PROJECT_CATEGORY: Record<string, ProjectCategory> = {
  animaldot: 'embedded',
  memesat: 'embedded',
  'audio-tracking-car': 'embedded',
  'smart-plant-watering-assistant': 'embedded',
  'parmco-ble-motor': 'embedded',
  'primeforge-fpga': 'hardware',
  'led-frequency-filter': 'hardware',
  'album-art-matrix': 'hardware',
  'pdms-microfluidic-mixer': 'research',
  'paper-trading-harness': 'research',
  'break-buddy': 'research',
  'kitchen-chaos-vr': 'vr',
  'vr-portfolio-1': 'vr',
  'vr-portfolio-2': 'vr',
  ashfall: 'vr',
  'personal-portfolio': 'web',
  'freight-carrier-website': 'web',
  'freight-operations-portal': 'web',
  'musical-artist-site': 'web',
  'relay-oms': 'web',
  'live-election-platform': 'web',
  'qr-worlds': 'web',
  'ubersicht-widgets': 'web',
  'website-development': 'web',
  'travel-itinerary-application': 'web',
  exocortex: 'ai',
  windowpet: 'ai',
  'screen-coach': 'ai',
  'damage-claim-verifier': 'ai',
  'capital-one': 'web',
};

/**
 * Tile media by slug — what shows in each project tile's preview area.
 *  - model : interactive 3D model from /public/models
 *  - site embed:true : live iframe (ONLY for sites that allow framing)
 *  - site embed:false: browser-card (sites that block embedding or would self-recurse);
 *                      add `screenshot: '/work-shots/<file>'` when an image is available
 * Anything omitted falls back to the atmospheric panel.
 */
const PROJECT_TILE_MEDIA: Record<string, TileMedia> = {
  // 3D models
  animaldot: { kind: 'model', src: '/models/sleeping_dog.glb', alt: 'AnimalDot smart bed' },
  // Satellite model is authored lying flat — stand it upright (right-side up).
  memesat: { kind: 'model', src: '/models/satellite.glb', alt: 'MEMESat-1 CubeSat', rotation: [Math.PI / 2, 0, 0] },
  'kitchen-chaos-vr': { kind: 'video', src: '/media/kitchen-chaos.mp4', poster: '/media/kitchen-chaos-poster.jpg', alt: 'Kitchen Chaos VR gameplay' },
  'vr-portfolio-1': { kind: 'model', src: '/models/quest3.glb', alt: 'Meta Quest 3 headset' },
  'vr-portfolio-2': { kind: 'model', src: '/models/quest3.glb', alt: 'Meta Quest 3 headset' },
  'audio-tracking-car': { kind: 'model', src: '/models/robot_car.glb', alt: 'Audio tracking car', rotation: [Math.PI / 2, 0, 0] },
  'smart-plant-watering-assistant': { kind: 'model', src: '/models/raspberry_pi_3.glb', alt: 'Raspberry Pi plant monitor' },
  'capital-one': { kind: 'model', src: '/models/capital_one.glb', alt: 'Capital One' },

  // Live, embeddable sites
  'live-election-platform': { kind: 'site', url: 'https://nsbe-election.vercel.app/', embed: true },
  // Self-framing (this site) would render the embedded splash, so use a screenshot of the live site.
  'personal-portfolio': { kind: 'image', src: '/media/portfolio-preview.jpg', alt: 'jalenedusei.com home page' },
  'freight-carrier-website': { kind: 'site', url: 'https://www.kulenterprises.com', embed: true },
  'musical-artist-site': { kind: 'site', url: 'https://www.akilahmali.com/', embed: true },
  'parmco-ble-motor': { kind: 'site', url: 'https://jke48222.github.io/parmco/', embed: true },
  'website-development': { kind: 'site', url: 'https://nsbe.uga.edu/', embed: true },
  
  // Deterministic planet generator — animated spinning globe fits it perfectly
  'qr-worlds': { kind: 'globe' },

  // Hardware demo video (FPGA prime search test run)
  'primeforge-fpga': {
    kind: 'video',
    src: '/media/primeforge.mp4',
    poster: '/media/primeforge-poster.jpg',
    alt: 'PrimeForge FPGA prime engine running a timed prime search',
  },

  // LED frequency filter demo video
  'led-frequency-filter': {
    kind: 'video',
    src: '/media/led-filter.mp4',
    poster: '/media/led-filter-poster.jpg',
    alt: 'LED frequency filter lighting different LEDs by frequency band',
  },
};

/** YouTube demo reels by slug, surfaced as a "Demos" section on the detail page. */
const PROJECT_DEMOS: Record<string, { title: string; youtubeId: string }[]> = {
  'vr-portfolio-1': [
    { title: 'Solar System Simulation', youtubeId: 'ST085IwEZbM' },
    { title: 'Rube Goldberg Physics Machine', youtubeId: '4hvh4dVooB8' },
    { title: 'Basic VR Exergame', youtubeId: 'ftHgEV30io0' },
    { title: 'Interactive Puzzle Game', youtubeId: '_D0tF47Tlmg' },
  ],
  'vr-portfolio-2': [
    { title: 'VR Mini Museum: Locomotion & Interaction', youtubeId: 'aNtIdMpoW0Q' },
    { title: 'Mixed Reality Room: Hand-Tracked Interaction', youtubeId: '3VdwPQK4RoU' },
  ],
  'smart-plant-watering-assistant': [
    { title: 'Smart Plant Watering Assistant Demo', youtubeId: '6tDUzRHrJFg' },
  ],
  'break-buddy': [
    { title: 'BreakBuddy Walkthrough', youtubeId: '8zXH5A4kdt0' },
  ],
};

/** Real photo galleries by slug, shown on the detail page (and openable full-size). */
const PROJECT_GALLERY: Record<string, { src: string; alt: string }[]> = {
  animaldot: [
    { src: '/media/animaldot-poster.png', alt: 'AnimalDot capstone research poster' },
  ],
  'pdms-microfluidic-mixer': [
    { src: '/media/pdms-1.jpg', alt: 'PDMS microfluidic mixer device' },
    { src: '/media/pdms-2.jpg', alt: 'PDMS microfluidic channel under the microscope' },
    { src: '/media/pdms-3.jpg', alt: 'Microfluidic mixing at a channel junction' },
    { src: '/media/pdms-4.jpg', alt: 'PDMS chip fabrication step' },
    { src: '/media/pdms-5.jpg', alt: 'Serpentine mixing channel detail' },
    { src: '/media/pdms-6.jpg', alt: 'PDMS device on the test setup' },
    { src: '/media/pdms-7.jpg', alt: 'Microfluidic mixer characterization' },
  ],
};

/** All projects (3D-linked core + standalone CV projects), ordered with featured first. */
export function getAllProjectsForWork(): WorkProject[] {
  const all: WorkProject[] = [...buildCoreProjects(), ...extraProjects].map((p) => {
    const tileMedia = p.tileMedia ?? PROJECT_TILE_MEDIA[p.id];
    // Surface a "View live" link on the detail page whenever the tile points at a real site.
    const liveUrl = p.liveUrl ?? (tileMedia?.kind === 'site' ? tileMedia.url : undefined);
    return {
      ...p,
      category: p.category ?? PROJECT_CATEGORY[p.id],
      tileMedia,
      liveUrl,
      demos: p.demos ?? PROJECT_DEMOS[p.id],
      gallery: p.gallery ?? PROJECT_GALLERY[p.id],
    };
  });
  const byId = new Map(all.map(p => [p.id, p]));
  const featured = FEATURED_IDS.map(id => byId.get(id)).filter((p): p is WorkProject => Boolean(p));
  const featuredSet = new Set<string>(FEATURED_IDS);
  const rest = all.filter(p => !featuredSet.has(p.id));
  return [...featured, ...rest];
}

export function getProjectBySlug(slug: string): WorkProject | undefined {
  return getAllProjectsForWork().find(p => p.id === slug);
}

export const helpText = [
  'Available commands:',
  '  help          - Display this message',
  '  ls            - List all files',
  '  open [file]   - Open a file (e.g. open animaldot.cpp)',
  '  run [name]    - Same as open, by executable name',
  '  theme [name]  - Switch theme (e.g. theme light, theme bulldogred)',
  '  about         - Open about.md',
  '  skills        - Open skills.json',
  '  resume        - Open resume.pdf',
  '  cv            - Open cv.pdf',
  '  clear         - Clear terminal',
  '',
  'Project files in the explorer open their 3D model.',
];
