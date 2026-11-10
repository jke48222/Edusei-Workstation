/**
 * Project data interface defining the structure for portfolio projects.
 * These five carry a 3D model and the richest write-ups; `extraProjects`
 * below holds the rest. `getAllProjectsForWork()` merges both.
 */
export interface ProjectData {
  id: string;
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
  openForWork: false,
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
    title: 'Full Stack Developer',
    company: 'Yamaha Motor Corporation, U.S.A.',
    location: 'Kennesaw, GA',
    period: 'November 2026 – Present',
    highlights: [
      'Look after the AI shopping assistant on yamaha-motor.com, the chat that helps shoppers find parts that fit their vehicle, compare current models, find a dealer, and get answers about store policies.',
      'Keep its answers current by running the daily jobs that refresh what it knows about parts, accessories, and models.',
      "Check every change against a set of test questions before it reaches shoppers, and build features for Yamaha's online store alongside it.",
    ],
  },
  {
    title: 'Freelance Software Engineer',
    company: 'Self-Employed',
    location: 'Atlanta, GA',
    period: 'May 2026 – October 2026',
    highlights: [
      "Rebuilt the website for Cake Artista, a Maryland cake studio: custom cake consultations, an online shop for cake kits and classes, an assistant that answers visitors' questions, and pages the owner can edit herself. Live at cake-artista.vercel.app ahead of its move to cakeartista.com.",
      'Designed, built, and launched kulenterprises.com for KUL Enterprises, a Georgia freight carrier: 22 pages the owner can edit without touching code, site search, spam-protected forms, and text colors that meet accessibility standards.',
      "Then built the carrier's staff a private, invite-only portal for deciding whether a freight broker can be trusted with a load, with four staff roles and a log of every change.",
      'Built and launched akilahmali.com for recording artist Akilah Mali: a 3D control room fans can explore, email signups, and merch sold through a hosted store.',
    ],
  },
  {
    title: 'Business Analyst Intern',
    company: 'Capital One',
    location: 'McLean, VA',
    period: 'June 2025 – August 2025',
    highlights: [
      'Built the business case for a CreditWise Notifications Preferences Center, one place where 60M+ customer accounts could manage how the product contacts them, and presented it to senior leadership.',
      "Measured how CreditWise's email campaigns performed and built a way to value their effect on engagement and retention, which backed a proposal for a new email domain.",
      'Worked with teams across the company on recommendations for how CreditWise should message its customers, and presented them to senior leadership.',
      'Used SQL, Python, Excel, and charts to track the key numbers behind product roadmap decisions.',
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
      'Ran 50+ lab experiments, including ELISA tests and DNA and RNA extractions, for malaria research projects.',
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
    tagline: 'A small robot car that drives toward a sound.',
    period: 'January 2025 – April 2025',
    location: 'ECSE Design Methodology',
    objectLabel: 'Car',
    accentColor: '#ff6b35',
    github: 'https://github.com/jke48222/Audio-Tracking-Car',
    description: [
      'A little robot car that chases sound. Two microphones and a set of analog circuits work out which direction a tone is coming from, and the car steers toward it.',
      'The direction-finding happens entirely in circuits, before any code runs. A Raspberry Pi reads the result and adjusts the wheel speed to stay on course, and a mode switch with a countdown before it moved kept it from driving itself off the table.',
    ],
    techStack: ['Python', 'Raspberry Pi 4', 'Analog Filters', 'Comparators', 'Closed-Loop Control'],
    additionalProjects: [
      {
        title: 'LED Frequency Filter',
        period: 'August 2024 – December 2024',
        description: [
          'A circuit that listens to a signal and sorts it into frequency bands, lighting up a different LED for each one so you can actually see sound.',
          'I went through three versions, first in simulation and then on a breadboard, fixing a weak signal, a flipped signal, and false triggers between bands until each LED lit cleanly.',
        ],
      },
      {
        title: 'Smart Plant Watering Assistant',
        period: 'August 2025 – November 2025',
        description: [
          "A battery-powered monitor that keeps watch over a plant's world: soil moisture, temperature, and light, with alerts and a little screen with a 'mood' face that tells you how it's feeling.",
          'The fun part was getting clean readings. Three sensors share a single input on a small Raspberry Pi Pico board, and a smoothing filter on each one calms the noisy data.',
        ],
      },
    ],
  },
  {
    id: 'animaldot',
    executable: 'animaldot',
    title: 'AnimalDot Smart Bed',
    tagline: "A pet bed that reads a dog's heart rate and breathing without touching them.",
    period: 'August 2025 – May 2026',
    location: 'Capstone Design',
    objectLabel: 'Dog',
    accentColor: '#4ecdc4',
    description: [
      "AnimalDot is a pet bed that reads a dog's heart rate and breathing without ever touching them. A vibration sensor in the frame picks up the tiny movements a body makes just by resting, and the software pulls a heartbeat out of that noise.",
      'I wrote all of the software for our team (36 of 37 commits). The bed filters out movement and noise to find each heartbeat, then sends the readings over Bluetooth or WiFi.',
      'The readings show up in an iPhone app and in a second phone app that switches from Bluetooth to WiFi to the cloud as needed, backed by a server that can run the same processing in the cloud.',
    ],
    techStack: ['ESP32', 'C++ (PlatformIO)', 'NimBLE / BLE', 'MQTT', 'DSP', 'SwiftUI', 'React Native', 'Express', 'PostgreSQL'],
    additionalProjects: [
      {
        title: 'BreakBuddy',
        period: 'August 2025 – December 2025',
        description: [
          'BreakBuddy is a guilt-free break app for teachers. It turns a spare two to five minutes into a guided micro-break, with just enough of a social nudge to make it stick.',
          'I designed it the proper way: interviews, sorting the findings into themes, and pinning down the real problem before drawing a single screen, then testing paper and polished prototypes.',
          'The result has a forgiving timer, thoughtful error states, and a reports dashboard that tracks streaks without making you feel bad about missing one.',
        ],
      },
    ],
  },
  {
    id: 'kitchen-chaos-vr',
    executable: 'kitchenchaos',
    title: 'Kitchen Chaos VR',
    tagline: 'A two-player VR cooking game for the Meta Quest 3.',
    period: 'October 2025 – December 2025',
    location: 'Virtual Reality, CSCI 6830',
    objectLabel: 'Quest 3',
    accentColor: '#a855f7',
    github: 'https://github.com/jke48222/VR-Final-Project',
    description: [
      'Kitchen Chaos is Overcooked in VR, a co-op cooking game for the Meta Quest 3 where you and a friend scramble to plate dishes before the timer (and the chaos) catches up with you.',
      'Everything runs on physics: you grab, chop, and throw 133 different food items across 8 recipes, and both players see every flying ingredient in sync. We built it as an equal two-person team.',
      'At the end of each round an AI judge tastes your dish, scores it, and roasts (or praises) you out loud with text-to-speech and all.',
    ],
    techStack: ['Unity3D', 'C#', 'Meta Quest 3', 'VelNet', 'OpenXR', 'Meta XR SDK', 'REST APIs'],
    additionalProjects: [
      {
        title: 'VR Portfolio 2',
        period: 'October 2025 – November 2025',
        github: 'https://github.com/jke48222/VR-Portfolio-2',
        description: [
          'Two polished VR and mixed-reality experiences for the Meta Quest 3: a VR mini-museum you walk through, and a mixed-reality room where digital objects share your actual space.',
          'It uses the harder parts of VR and mixed reality: hand tracking, seeing your real room through the headset, objects that hide behind your real furniture, and grabbing things from across the room.',
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
    tagline: 'Software for MEMESat-1, a small satellite built to fly in space.',
    period: 'March 2024 – December 2024',
    location: 'Small Satellite Research Laboratory (SSRL)',
    objectLabel: 'CubeSat',
    accentColor: '#06b6d4',
    description: [
      'MEMESat-1 is a CubeSat, a small standard-size satellite, built to actually fly. I worked on the flight software that runs it, on the small computers inside.',
      "A lot of the job was the careful, unglamorous kind of engineering that space demands: getting the satellite's parts talking to each other reliably, and writing the tests that prove the software won't fall over in orbit when something unexpected happens.",
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
    ],
  },
  {
    id: 'capital-one',
    executable: 'capitalone',
    title: 'Capital One Internship',
    tagline: 'Business Analyst intern on CreditWise, which has 60M+ users.',
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

export const RELATED_TITLE_TO_SLUG: Record<string, string> = {
  'AnimalDot': 'animaldot',
  'AnimalDot Smart Bed': 'animaldot',
  'AnimalDot Smart Bed (Senior Capstone)': 'animaldot',
  'Personal Portfolio Website': 'personal-portfolio',
  'Musical Artist Website': 'musical-artist-site',
  'Musical Artist Website and Storefront': 'musical-artist-site',
  'Akilah Mali: Musical Artist Website': 'musical-artist-site',
  'Freight Carrier Website': 'freight-carrier-website',
  'Freight Carrier Marketing Website': 'freight-carrier-website',
  'KUL Enterprises: Freight Carrier Marketing Website': 'freight-carrier-website',
  'Freight Carrier Operations Portal': 'freight-operations-portal',
  'KUL Enterprises: Broker Credit-Vetting Operations Portal': 'freight-operations-portal',
  'Cake Artista: Bakery Storefront and Academy': 'cake-artista',
  'Cake Artista': 'cake-artista',
  'Cake Studio Website': 'cake-artista',
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
  'Otto': 'otto',
  'Otto: AI Assistant in the MacBook Notch': 'otto',
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

/** One gallery image. Wide captures are 1600x1000; phone captures are 780x1688. */
export interface GalleryShot {
  src: string;
  alt: string;
  device?: 'phone';
}

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
  /**
   * Real screenshots shown as a gallery on the detail page. `device: 'phone'` marks a
   * portrait capture taken at phone width; those get their own row of tall tiles.
   */
  gallery?: GalleryShot[];
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
    id: 'otto',
    title: 'Otto: AI Assistant in the MacBook Notch',
    shortTitle: 'Otto',
    tagline: 'A Mac assistant in the notch that answers with sources and asks before it acts.',
    period: 'September 2026 – Present',
    location: 'Personal project',
    category: 'ai',
    github: 'https://github.com/jke48222/otto',
    liveUrl: 'https://ottonotch.com',
    techStack: ['Swift', 'SwiftUI', 'AppKit', 'Anthropic Messages API', 'Server-Sent Events', 'EventKit', 'Sparkle', 'XCTest'],
    description: [
      "I kept leaving whatever I was doing to ask Claude a quick question, and the notch was the one part of my screen I never used. So I put Claude in it. Rest the pointer on the notch or press ⌥Space, drop in a file, the browser tab you're reading, or the window you were just in, and the answer streams in right under the camera with its sources. Move away and it tucks back into the housing.",
      'It can also do things for you: add calendar events and reminders, run Shortcuts and scripts, and open links. Each action waits on a card that shows exactly what will happen, and only a click or keypress on your own Mac can approve it. Actions stay off until you turn them on.',
      'The hardest part was making it open only when you mean it, not every time you reach for a menu. Version 1.1 added a shelf for files, voice input, and a searchable history that stays on your Mac. Otto launched on September 30, 2026 for $19 with a 14-day trial, and its source code is open on GitHub.',
    ],
    relatedProjects: [
      { title: 'WindowPet', slug: 'windowpet', period: 'August 2026 – Present' },
      { title: 'Screen-Coach AI', slug: 'screen-coach', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'exocortex',
    title: 'Exocortex: Local-First Personal Memory System',
    shortTitle: 'Exocortex',
    tagline: 'A private memory of my digital life, kept on my own computer, that my AI tools can share.',
    period: 'August 2026 – Present',
    location: 'Personal project',
    category: 'ai',
    github: 'https://github.com/jke48222/exocortex',
    techStack: ['Swift', 'SQLite / FTS5', 'MLX', 'Qwen3-Embedding', 'Apple Foundation Models', 'MCP', 'Python'],
    description: [
      'Exocortex is my attempt at a second brain that actually belongs to me. Fourteen sources, including my messages, email, browsing, AI chats, and phone backups, flow into one store of about 100,000 events on my own machine. Secrets get scrubbed out, backups are encrypted, and nothing leaves the computer.',
      'Search is the heart of it. In a test, it found the right memory 19 times out of 20, where plain keyword search found 11. AI tools connect through a gate with limits I set: each tool gets its own level of trust, none can read everything at once, and every access is written to a tamper-evident log.',
      "Every night it looks for contradictions, keeps track of what I've committed to, and writes me a weekly summary, with every claim checked against its source.",
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
    tagline: "A little creature that lives on top of your Mac's windows, with an AI assistant inside.",
    period: 'August 2026 – Present',
    location: 'Personal project',
    category: 'ai',
    github: 'https://github.com/jke48222/WindowPet',
    techStack: ['Swift', 'AppKit', 'Core Animation', 'macOS Accessibility API', 'Anthropic Messages API', 'XCTest'],
    description: [
      "WindowPet is a little creature that stands on your actual windows. It rides along when you drag one, falls when you close it, and leaps from window to window. It never asks to record your screen, because a desktop pet shouldn't be spyware.",
      'Talk to it and it can help. It handles simple commands on its own, hands harder requests to Claude, and has a backup that runs entirely on your Mac. Nothing destructive happens without your yes.',
      'It installs like any Mac app, comes with four looks plus an importer for characters drawn by other artists, and uses about a quarter of a percent of the processor while it sleeps.',
    ],
    relatedProjects: [
      { title: 'Otto', slug: 'otto', period: 'September 2026 – Present' },
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
    github: 'https://github.com/jke48222/screen-coach',
    techStack: ['Swift', 'AppKit', 'macOS Accessibility API', 'ScreenCaptureKit', 'MLX', 'Holo1.5-7B', 'XCTest'],
    description: [
      "Ask 'where do I turn on dark mode?' and a cursor glides to the exact control. Screen-Coach first reads the layout information your Mac already keeps for screen readers. In an app that supports it, it found 12 of 12 targets in under a tenth of a millisecond, and it only turns to an AI vision model running on your Mac when that layout can't answer.",
      'I measured before I built, and the measurements shaped the design. The pointer ring shows how sure it is, and apps you block are completely off-limits. I added that rule after noticing it could read the text of messages.',
    ],
    relatedProjects: [
      { title: 'Otto', slug: 'otto', period: 'September 2026 – Present' },
      { title: 'WindowPet', slug: 'windowpet', period: 'August 2026 – Present' },
      { title: 'Exocortex', slug: 'exocortex', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'personal-portfolio',
    title: 'Personal Portfolio Website',
    tagline: 'A home page that plays as you scroll and opens into a 3D workstation you can explore.',
    period: 'January 2026 – Present',
    location: 'Atlanta, GA',
    github: 'https://github.com/jke48222/edusei-workstation',
    liveUrl: 'https://www.jalenedusei.com',
    category: 'web',
    techStack: ['React', 'TypeScript', 'Vite', 'React Three Fiber', 'Framer Motion', 'Zustand', 'Tailwind CSS', 'PWA', 'Vercel'],
    description: [
      "This is the site you're looking at. The home page is a video that plays as you scroll, and behind it sits a 3D workstation you can explore, complete with a retro terminal.",
      'It comes with about two dozen color themes, can be installed like an app, and pauses the 3D when nothing needs it. I designed, built, and launched it myself.',
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
    tagline: 'A website for KUL Enterprises, a Georgia freight carrier, that the owner can update without code.',
    period: 'June 2026 – Present',
    location: 'Freelance client work (private repo)',
    category: 'web',
    liveUrl: 'https://www.kulenterprises.com',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'TinaCMS', 'Tailwind CSS v4', 'Framer Motion', 'Resend', 'Vitest', 'Vercel'],
    description: [
      'KUL Enterprises is an independent freight carrier in Georgia, and I was its whole web team: design, building, and launch. We tried twelve design directions, twenty working versions in all, before choosing one, then launched 22 pages covering services, driver hiring, safety, quotes, and legal.',
      "The owner can edit every sentence on the site without touching code. The opening film is one I made from the owner's storyboard using AI tools and Final Cut Pro. Search covers the whole site, the four forms are protected from spam, and every text color meets accessibility standards for contrast.",
    ],
    relatedProjects: [
      { title: 'Freight Carrier Operations Portal', slug: 'freight-operations-portal', period: 'August 2026 – Present' },
      { title: 'Cake Studio Website', slug: 'cake-artista', period: 'October 2026 – Present' },
      { title: 'Musical Artist Website', slug: 'musical-artist-site', period: 'May 2026 – Present' },
    ],
  },
  {
    id: 'freight-operations-portal',
    title: 'Freight Carrier Operations Portal',
    shortTitle: 'Operations Portal',
    tagline: 'A private tool the same carrier uses to decide which freight brokers to trust.',
    period: 'August 2026 – Present',
    location: 'Freelance client work (private repo)',
    category: 'web',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Supabase', 'PostgreSQL', 'Vercel'],
    description: [
      "When a broker calls a carrier with a load, someone has to decide fast whether that broker can be trusted with the truck. This portal turns KUL's screening process into software: a database of brokers, KUL's twelve vetting questions with government safety records linked in, and a green, yellow, or red rating. A red rating blocks the broker until an administrator clears it and records why.",
      "The rules are enforced by the database itself, not just the app, so each person can only do what their role allows, and every change is logged. It's invite-only, with four staff roles.",
    ],
    relatedProjects: [
      { title: 'Freight Carrier Website', slug: 'freight-carrier-website', period: 'June 2026 – Present' },
    ],
  },
  {
    id: 'cake-artista',
    title: 'Cake Studio Website',
    shortTitle: 'Cake Studio Site',
    tagline: "A Maryland cake studio's website for custom cakes, cake kits, and classes.",
    period: 'October 2026 – Present',
    location: 'Freelance client work (private repo)',
    category: 'web',
    liveUrl: 'https://cake-artista.vercel.app',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Sanity', 'Anthropic Claude API', 'Vitest', 'Vercel'],
    description: [
      "A cake gets ordered from a photo, and on Cake Artista's old WordPress site the main photo took 19 seconds to appear in Google's phone speed test. So I rebuilt the studio's whole site, from design to launch.",
      "Visitors can book a custom cake consultation, buy cake kits, subscribe to a kit club, sign up for classes, and browse custom cakes by type and color, all in English or Spanish. The owner can change any words or photos herself, right from the live site. Sandrita, the site's assistant, answers questions using only what's on the site, and nothing goes in the cart unless the visitor taps.",
      "In the same speed test the main photo now appears in 4 seconds, and the site scores 100 for accessibility, up from 91. It's live at its own address until it moves to cakeartista.com. Prices are samples for now, and checkout stays in demo mode until the studio's payment account is connected.",
    ],
    relatedProjects: [
      { title: 'Freight Carrier Website', slug: 'freight-carrier-website', period: 'June 2026 – Present' },
      { title: 'Musical Artist Website', slug: 'musical-artist-site', period: 'May 2026 – Present' },
    ],
  },
  {
    id: 'musical-artist-site',
    title: 'Musical Artist Website',
    tagline: "A recording artist's home on the web, built around a 3D control room fans can explore.",
    period: 'May 2026 – Present',
    location: 'Freelance client work (private repo)',
    category: 'web',
    liveUrl: 'https://www.akilahmali.com',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'three.js', 'React Three Fiber', 'GSAP', 'Web Audio API', 'Vercel'],
    description: [
      "A home base for recording artist Akilah Mali, somewhere fans can listen, watch, and look around. The centerpiece is a 3D 'control room' with security-camera-style video feeds.",
      "It's built so there's nothing to keep running: music and tour dates come from services she already uses, email signups go to Laylo, and merch is sold through a hosted store. The 3D waits behind an instant paper cover, which cut about 46 MB from what the first page has to load.",
    ],
    relatedProjects: [
      { title: 'Freight Carrier Website', slug: 'freight-carrier-website', period: 'June 2026 – Present' },
      { title: 'Cake Studio Website', slug: 'cake-artista', period: 'October 2026 – Present' },
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
    ],
  },
  {
    id: 'relay-oms',
    title: 'Relay: Order Management & Fulfillment',
    shortTitle: 'Relay OMS',
    tagline: 'An order system for online stores that never sells more than it has in stock.',
    period: 'July 2026',
    location: 'Personal project',
    category: 'web',
    github: 'https://github.com/jke48222/relay-oms',
    techStack: ['Elixir', 'Phoenix', 'Ecto', 'PostgreSQL', 'Phoenix Channels', 'React 19', 'TypeScript', 'Docker', 'Kubernetes'],
    description: [
      'Relay is a small version of the system behind an online store. Orders come in, stock is set aside across four warehouses, and each order moves from received to delivered while a live dashboard shows it happening.',
      "It's built for the moments that go wrong. Two orders can't both take the last item, a restart doesn't lose anything, and 52 automated tests check exactly those cases.",
    ],
    relatedProjects: [
      { title: 'Live Election Platform', slug: 'live-election-platform', period: 'March 2026 – June 2026' },
      { title: 'Freight Carrier Operations Portal', slug: 'freight-operations-portal', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'live-election-platform',
    title: 'Live Election Platform',
    tagline: 'Live voting for a room full of people, used to run a real chapter election.',
    period: 'March 2026 – June 2026',
    location: 'for a campus engineering student organization',
    category: 'web',
    github: 'https://github.com/jke48222/live-election-platform',
    techStack: ['Next.js 14', 'JavaScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'WebSockets', 'Row-Level Security'],
    description: [
      'When a room full of people needs to vote live, things break in funny ways. Everyone submits at once, someone tries to vote twice, and the presenter loses control of the pace. This system fixes all three, and it ran a real chapter election with 14 positions and 39 candidates.',
      "The host walks the room through each race, and ballots appear on everyone's screen the moment voting opens. To stop double votes, it checks each device, checks members against the dues list at check-in, and has the database itself refuse a second ballot. Before election night I ran a security review that found 29 issues and confirmed the fixes with 42 tests. Since then I've started rebuilding it so other organizations can use it.",
    ],
    relatedProjects: [
      { title: 'Relay: Order Management & Fulfillment', slug: 'relay-oms', period: 'July 2026' },
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
    ],
  },
  {
    id: 'qr-worlds',
    title: 'QR Worlds',
    tagline: 'Type any web address and watch it become a little planet you can still scan.',
    period: 'August 2026 – Present',
    location: 'Personal project',
    category: 'web',
    techStack: ['TypeScript', 'three.js', 'GLSL', 'Vite', 'Vitest'],
    description: [
      "QR Worlds turns any web address into a tiny world. The address's QR code becomes floating ground made of blocks, and the address itself decides the planet above it: its colors, rings, moons, and clouds. Type a letter and the whole world rebuilds in a few milliseconds.",
      "The same address always grows the same planet, in any browser. And the code still scans: a test checks the rendered picture against the real QR code, and the errors stay within what a phone's scanner can correct.",
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
    location: 'Personal project',
    category: 'hardware',
    github: 'https://github.com/jke48222/album-art-matrix',
    techStack: ['Python', 'C', 'MicroPython', 'Raspberry Pi 5', 'HUB75', 'KiCad', 'ngspice', 'systemd'],
    description: [
      "A wall of nine LED panels that knows what's playing. The current album cover shows up as a spinning record, run by a Raspberry Pi 5 that follows Apple Music, with more music sources on the way.",
      'Getting the colors right was the craft. I pointed a color sensor at the panels themselves to tune them, so album art looks true. I also designed the circuit board that connects the Pi to the panels and splits the power safely, ready to send for manufacturing. The panels arrived in August, and turning it on for the first time is next.',
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
    tagline: 'A prime-number finder built directly in hardware that found all 5,761,455 primes below 100 million.',
    period: 'January 2026 – May 2026',
    location: 'Advanced Digital Design, CSEE 4280',
    category: 'hardware',
    gallery: [
      { src: '/media/primeforge-monitor.jpg', alt: 'PrimeForge VGA output: self-check and last-20-primes readout' },
      { src: '/media/primeforge-board.jpg', alt: 'Nexys A7 FPGA with PMOD joystick, keypad, and VGA output' },
    ],
    techStack: ['Verilog', 'Artix-7 FPGA', 'Vivado', 'DDR2', 'SD / SPI', 'VGA', 'Icarus Verilog'],
    description: [
      "PrimeForge finds prime numbers using hardware alone. There's no operating system and no ordinary program running, just custom circuits on a programmable chip doing the math.",
      'You choose between two methods with a joystick and keypad, and a screen shows the live count, the last twenty primes, and the run time. It found all 5,761,455 primes below 100 million, exactly the right answer, and checked itself against a reference list on an SD card as it ran.',
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
    tagline: 'Control a real motor from an iPhone over Bluetooth, and have it hold a set speed on its own.',
    period: 'January 2026 – May 2026',
    location: 'Embedded Systems II, ECSE 4235',
    category: 'embedded',
    liveUrl: 'https://jke48222.github.io/parmco/',
    github: 'https://github.com/jke48222/parmco',
    techStack: ['C', 'BlueZ', 'Raspberry Pi 4', 'BLE', 'SwiftUI', 'Core Bluetooth', 'ARMv7 Assembly', 'pigpio', 'systemd'],
    description: [
      'PARMCO lets you control a physical motor from your iPhone over Bluetooth. Pick a direction, dial in a speed, and watch the live speed come back to the app.',
      'A Raspberry Pi handles the Bluetooth connection and drives the motor with code I wrote down at the hardware level. It can also hold a target speed by itself, settling at 4,500 RPM in about a second, and it starts back up on its own after a power cut.',
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
    tagline: 'Twelve Mac desktop widgets that share one look.',
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
      'They share one style, so twelve separate projects still feel like a set: the same frosted-glass cards, the same fonts, the same drag-and-resize, and none of them looks broken when the wifi drops.',
      "Each one installs with a single command. I first built the whole set as a native Mac widget app, then switched to Übersicht because Apple's widgets can't animate continuously.",
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
    tagline: "A 24-hour hackathon project that reviews damage claims and isn't fooled by notes planted in the photos.",
    period: 'June 2026',
    location: 'HackerRank Orchestrate hackathon (solo)',
    category: 'ai',
    techStack: ['Python', 'Anthropic Messages API', 'JSON-Schema Tool Use', 'Pydantic', 'unittest'],
    description: [
      'A solo, 24-hour hackathon project. Given photos, chat transcripts, and customer history for claims about damaged cars, laptops, and packages, it decides whether the evidence supports each claim, and it returned a complete verdict for all 44 test claims, even when calls to the AI service failed.',
      "The rule was simple: the AI looks at the photos, and plain code does the bookkeeping. That raised the share of practice answers that were exactly right from 65% to 100%. It also caught all seven trick claims, like sticky notes in photos saying 'approve this claim', without letting them change the verdict.",
    ],
    relatedProjects: [
      { title: 'Exocortex', slug: 'exocortex', period: 'August 2026 – Present' },
    ],
  },
  {
    id: 'paper-trading-harness',
    title: 'Quantitative Paper-Trading Harness',
    shortTitle: 'Trading Harness',
    tagline: 'A testing setup for trading ideas, built mainly to stop me from fooling myself.',
    period: 'July 2026 – Present',
    location: 'Personal project',
    category: 'research',
    techStack: ['TypeScript', 'Node.js', 'Binance API', 'Alpaca Paper API', 'Pine Script', 'launchd'],
    description: [
      "This tests trading strategies with pretend money, and its main job is to keep me honest. Every idea is written into a permanent log before it runs, so I can't quietly change the rules after seeing the results.",
      "Across seven trials and 114 runs, realistic trading costs and strict statistical tests rejected every strategy that traded a single asset. The one result that survived stays on hold until it proves itself on new data. It has run on its own for over five weeks without a missed health check, and it's simulation only: the code has no way to place a real trade.",
    ],
  },
  {
    id: 'ashfall',
    title: 'Ashfall: The Last Hours of Pompeii',
    shortTitle: 'Ashfall',
    tagline: 'A game prototype where you flip Pompeii between its golden age and its final hours.',
    period: 'June 2026',
    location: 'Personal project',
    category: 'vr',
    github: 'https://github.com/jke48222/ashfall',
    techStack: ['Unreal Engine 5.8', 'C++', 'Lumen', 'Nanite', 'Python', 'three.js'],
    description: [
      'Ashfall is a time-travel puzzle game prototype set hours before Vesuvius erupts. Every street can flip between Pompeii at its height and Pompeii buried in ash, and changing the past is how you save people.',
      "I built the systems in Unreal Engine 5 that change each street's buildings, materials, lighting, and physics when you flip time, and that remember what you changed. The whole level is built automatically from properly licensed assets, and the same scene also runs in a web browser.",
    ],
    relatedProjects: [
      { title: 'Kitchen Chaos VR', slug: 'kitchen-chaos-vr', period: 'October 2025 – December 2025' },
    ],
  },
  {
    id: 'pdms-microfluidic-mixer',
    title: 'PDMS Microfluidic Mixer',
    shortTitle: 'PDMS Mixer',
    tagline: 'Tiny channels in a rubbery chip, designed to make two liquids mix.',
    period: 'January 2026 – May 2026',
    location: 'Microfabrication',
    category: 'research',
    techStack: ['PDMS', 'Photolithography', 'Soft Lithography', 'Cleanroom', 'Microfluidics'],
    description: [
      'At a small enough scale, liquids refuse to mix and just flow side by side. This project is a set of tiny channels, etched into a rubbery polymer, designed to force two fluids to fold into each other anyway.',
      'I made them in a cleanroom, making molds with UV light and then casting and sealing the rubbery chips by hand. Three channel shapes went head-to-head to see which mixed best.',
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
  'otto',
  'exocortex',
  'windowpet',
  'cake-artista',
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
  exocortex: 'ai',
  windowpet: 'ai',
  'screen-coach': 'ai',
  otto: 'ai',
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
  // Opens on custom cakes, the studio's main offering, with its popups off.
  'cake-artista': { kind: 'site', url: 'https://cake-artista.vercel.app/custom-cakes?popups=off', embed: true },
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

  // Otto's own product site. ottonotch.com allows framing from jalenedusei.com only
  // (frame-ancestors in the otto repo's vercel.json), so this stays blank anywhere else.
  otto: { kind: 'site', url: 'https://ottonotch.com', embed: true },

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
const PROJECT_GALLERY: Record<string, GalleryShot[]> = {
  animaldot: [
    { src: '/media/animaldot-poster.png', alt: 'AnimalDot capstone research poster' },
  ],
  otto: [
    { src: '/media/otto-1.jpg', alt: 'Otto open under the notch with the browser tab On Calm Software attached as a chip and a question typed into the composer' },
    { src: '/media/otto-2.jpg', alt: 'Context chips for a browser tab, an image, a PDF, and a text file above the composer' },
    { src: '/media/otto-3.jpg', alt: 'An answer in the notch with the page Otto read, the web search it ran, and a source pill for each site' },
    { src: '/media/otto-4.jpg', alt: 'Otto asking before it adds an event: a card showing the event, its time and calendar, with Don\'t add and Add Event buttons' },
    { src: '/media/otto-5.jpg', alt: 'The Shelf under the notch with five files, two of them selected, ready to ask about' },
    { src: '/media/otto-6.jpg', alt: 'The closed notch after a reply finished, with the first line of the answer under the camera' },
    { src: '/media/otto-7.jpg', alt: 'Otto Settings on the Models tab with the API key saved in Keychain, the Claude models, and the response style' },
    // ottonotch.com, captured from the live site on 2026-11-09 at 1440x900 and 390x844.
    { src: '/media/otto-site-1.jpg', alt: 'ottonotch.com: the page header shaped like a notch above the promo film, which shows an answer streaming in' },
    { src: '/media/otto-site-2.jpg', alt: 'ottonotch.com: the features Answers that stream in and Acts with your OK, each beside a screenshot of the app' },
    { src: '/media/otto-site-3.jpg', alt: 'ottonotch.com: Three steps from download to answer, as three numbered cards above a large view of the app' },
    { src: '/media/otto-site-4.jpg', alt: 'ottonotch.com: You decide what leaves your Mac, with one card for what stays and one for what is sent' },
    { src: '/media/otto-site-5.jpg', alt: 'ottonotch.com: the pricing page with the license at $19 once beside the trial and the requirements' },
    { src: '/media/otto-phone-1.jpg', device: 'phone', alt: 'On a phone, ottonotch.com opening with the headline The AI assistant that lives in your notch and two buttons' },
    { src: '/media/otto-phone-2.jpg', device: 'phone', alt: 'On a phone, the feature Acts with your OK under a screenshot of the app asking before it adds an event' },
    { src: '/media/otto-phone-3.jpg', device: 'phone', alt: 'On a phone, the pricing cards stacked: the license, the trial and the requirements' },
    { src: '/media/otto-phone-4.jpg', device: 'phone', alt: 'On a phone, the questions list with the first answer open' },
  ],
  // Captured from the live site on 2026-11-09 at 1440x900 and 390x844.
  'cake-artista': [
    { src: '/media/cake-artista-1.jpg', alt: 'The custom cakes page: five cakes fanned like playing cards beside the heading Custom cakes, by consult, with one card lifted on hover' },
    { src: '/media/cake-artista-2.jpg', alt: 'Site search answering the question is the vanilla kit vegan with a diets answer and four kits priced for the vegan option' },
    { src: '/media/cake-artista-3.jpg', alt: 'Sandrita, the site assistant, recommending the Vanilla Bean Kit with a product card and an Add button, over a row of tall cake photos' },
    { src: '/media/cake-artista-4.jpg', alt: 'The cake gallery filtered to cakes in gold: a four-column grid of cakes on gingham, harlequin and dotted grounds' },
    { src: '/media/cake-artista-5.jpg', alt: 'The Shop menu open from the header, listing three cake kits with prices beside four photo tiles' },
    { src: '/media/cake-artista-6.jpg', alt: 'The Vanilla Bean Kit page with the vegan option chosen, a quantity of 2 and an Add to cart button showing $102' },
    { src: '/media/cake-artista-7.jpg', alt: 'The Black Friday page: a box of cupcakes beside a dark panel with the bundle, what is inside it and a countdown' },
    { src: '/media/cake-artista-8.jpg', alt: 'The photo viewer open on a tiered cake, showing 2 of 10 with previous and next arrows' },
    { src: '/media/cake-artista-9.jpg', alt: 'A cake decorating course page in Spanish, with class dates and an enrol card' },
    { src: '/media/cake-artista-phone-1.jpg', device: 'phone', alt: 'On a phone, the assistant as a full-screen chat recommending a kit with a product card and diet choices' },
    { src: '/media/cake-artista-phone-2.jpg', device: 'phone', alt: 'On a phone, the menu open with shop and studio links beside small cake photos and a Book a consult button' },
    { src: '/media/cake-artista-phone-3.jpg', device: 'phone', alt: 'On a phone, the custom cakes page with the fanned cake cards under the heading and the gallery filters below' },
    { src: '/media/cake-artista-phone-4.jpg', device: 'phone', alt: 'On a phone, search results for is the vanilla kit vegan as a list of kits with vegan prices' },
  ],
  // Captured from the live site on 2026-11-09 at 1440x900 and 390x844.
  'freight-carrier-website': [
    { src: '/media/freight-carrier-website-1.jpg', alt: 'The opening brand film: a golden hummingbird with long tail streamers on black' },
    { src: '/media/freight-carrier-website-2.jpg', alt: 'Site search open over the home page, with matches for cold chain highlighted above the headline On the road. On your side.' },
    { src: '/media/freight-carrier-website-3.jpg', alt: 'The equipment section: a truck in the lion livery over a row of figures for trailer length, payload, states and year' },
    { src: '/media/freight-carrier-website-4.jpg', alt: 'The dry van page: line drawings of the tractor and trailer above a table of dimensions' },
    { src: '/media/freight-carrier-website-5.jpg', alt: 'The services carousel with the Reefer card enlarged in the centre between Dry Van and Dedicated' },
    { src: '/media/freight-carrier-website-6.jpg', alt: 'A map of the 48 states with the six-state home region in copper and Georgia highlighted on hover' },
    { src: '/media/freight-carrier-website-7.jpg', alt: 'The safety page: Stop the unsafe operation. Not the problem-solving. in white and gold on black' },
    { src: '/media/freight-carrier-website-8.jpg', alt: 'The Journey player on scene 5 of 17: a photo of open hills beside four lines of narration, over a strip of scene markers' },
    { src: '/media/freight-carrier-website-9.jpg', alt: 'The Safety menu open from the header with the carrier numbers, over the Over-the-Road page' },
    { src: '/media/freight-carrier-website-phone-1.jpg', device: 'phone', alt: 'On a phone, the menu open with page links, a list of freight services and a Get a quote button' },
    { src: '/media/freight-carrier-website-phone-2.jpg', device: 'phone', alt: 'On a phone, site search with matches for cold chain above the home page headline' },
    { src: '/media/freight-carrier-website-phone-3.jpg', device: 'phone', alt: 'On a phone, the safety statement in white and gold on black with its five steps' },
    { src: '/media/freight-carrier-website-phone-4.jpg', device: 'phone', alt: 'On a phone, the Road Ahead page: 11 years driving, then 2026 and 48 as a ruled list' },
  ],
  // Captured from the live site on 2026-11-09 at 1440x900 and 390x844.
  'musical-artist-site': [
    { src: '/media/musical-artist-site-1.jpg', alt: 'The Who Really Won? cover tearing in two like paper, with a 3D control room showing through the gap' },
    { src: '/media/musical-artist-site-2.jpg', alt: 'The 3D control room: a desk with seven lit monitors, a phone and a blue button, under a REC marker' },
    { src: '/media/musical-artist-site-3.jpg', alt: 'The camera part-way through its move toward one monitor, four screens filling the frame' },
    { src: '/media/musical-artist-site-4.jpg', alt: 'The Gone Away screen fading in over the monitor the camera is still closing on' },
    { src: '/media/musical-artist-site-5.jpg', alt: 'The Been There Once screen: the title across a full-screen photo, with arrows and a strip of track names' },
    { src: '/media/musical-artist-site-6.jpg', alt: 'The music video screen, with the title Who Really Won Music Video over a still from the video' },
    { src: '/media/musical-artist-site-7.jpg', alt: 'The camera above the blue button on the desk, with two monitors behind it' },
    { src: '/media/musical-artist-site-8.jpg', alt: 'The home page: a full-screen video with Tower of Roses in script and a Listen Now button' },
    { src: '/media/musical-artist-site-9.jpg', alt: 'The About page: a script heading, the artist biography in two columns and a portrait on red' },
    { src: '/media/musical-artist-site-phone-1.jpg', device: 'phone', alt: 'On a phone, the paper cover tearing open over the control room' },
    { src: '/media/musical-artist-site-phone-2.jpg', device: 'phone', alt: 'On a phone, the Been There Once screen with its title, arrows and track strip' },
    { src: '/media/musical-artist-site-phone-3.jpg', device: 'phone', alt: 'On a phone, the control room with its desk of monitors and a checkered floor' },
    { src: '/media/musical-artist-site-phone-4.jpg', device: 'phone', alt: 'On a phone, the menu open with five page links and a row of social icons' },
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
  '  contact       - Open contact.md',
  '  clear         - Clear terminal',
  '',
  'Project files in the explorer open their 3D model.',
];
