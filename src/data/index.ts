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
  const subject = encodeURIComponent(`Say hi — via ${profileData.name}'s portfolio`);
  const body = encodeURIComponent(
    `Hi ${profileData.name},\n\nI came across your portfolio and wanted to reach out.\n\n`
  );
  return `mailto:${profileData.email}?subject=${subject}&body=${body}`;
}

export const skillsData = {
  programming: [
    'Assembly', 'C', 'C#', 'C++', 'HTML', 'Java', 'JavaFX',
    'JavaScript', 'MATLAB', 'Python', 'R', 'SQL', 'TypeScript', 'Verilog'
  ],
  software: [
    'Autodesk Fusion 360', 'Blender', 'CAD', 'Figma', 'Git', 'GitHub',
    'Graphic Design', 'Klaviyo', 'Microsoft Suite', 'NASA F Prime', 'Next.js',
    'Node.js', 'PlatformIO', 'React Native', 'Sanity CMS', 'Shopify Storefront API',
    'Supabase', 'Tailwind CSS', 'Unity3D', 'Vercel', 'VR/MR Development',
    'Website Development', 'Wix', 'WordPress', 'Xilinx', 'Zephyr'
  ],
  ai: [
    'Anthropic Claude API', 'LLM Application Development', 'AI Agents & Tool Use',
    'Prompt Engineering', 'REST-based AI Integration', 'Structured (JSON) Outputs',
    'Wit.ai Natural Language Understanding', 'Speech Synthesis & Text-to-Speech',
  ],
  hardware: [
    '2U CubeSat', 'Basys2 FPGA Boards', 'BLE / NimBLE', 'Cleanroom Microfabrication',
    'ESP32', 'Geophones & Load Cells', 'Microfluidics', 'MQTT', 'PDMS Soft Lithography',
    'Photolithography', 'Raspberry Pi Pico 2W', 'Raspberry Pi 4', 'Sensors',
    'Signal Processing', 'STM32 Microcontrollers'
  ],
  core: [
    'Business Case Development', 'Collaboration', 'Data Analysis', 'Critical Thinking',
    'Human-Computer Interaction', 'Problem Solving', 'Product Strategy',
    'Project Management', 'Real-Time Systems', 'Strategic Leadership', 'Technical Communication'
  ],
};

export const workExperience = [
  {
    title: 'Business Analyst Intern',
    company: 'Capital One',
    location: 'McLean, VA',
    period: 'June 2025 – August 2025',
    highlights: [
      'Spearheaded development of a business case for a Notifications Preferences Center for CreditWise, projected to streamline customer communication management for 60M+ users.',
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
      'It runs closed-loop on a Raspberry Pi with PID motor control and encoder feedback. I also added a few demo modes and an emergency stop so it could be shown off without driving itself off the table.',
    ],
    techStack: ['Python', 'Raspberry Pi 4', 'PID Control', 'ADC Processing', 'Git'],
    additionalProjects: [
      {
        title: 'LED Frequency Filter',
        period: 'August 2024 – December 2024',
        description: [
          'A circuit that listens to a signal and sorts it into frequency bands, lighting up a different LED for each one so you can actually see sound.',
          'I tuned it on the oscilloscope until it classified bands at about 98% accuracy, trimming the design to keep the signal clean.',
        ],
      },
      {
        title: 'Smart Plant Watering Assistant',
        period: 'August 2025 – November 2025',
        description: [
          "A little system that keeps a plant alive so you don't have to think about it. It reads soil moisture, temperature, and light, and waters only when the plant actually needs it.",
          'The fun part was the signal work. I used op-amp conditioning and a Kalman filter to clean up the noisy sensor readings, then drove the pump with a predictive threshold. The whole thing runs as a tidy closed loop on a Raspberry Pi Pico.',
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
      'I wrote the ESP32 firmware in C++, including the sensor manager, the signal processing that tells a real pulse apart from a dog shifting around, and the radio stack that streams it all out over Bluetooth, WiFi, and MQTT.',
      'It ends up on your phone: a React Native app and a caregiver dashboard show live vitals, trends over time, and let you tune the bed from anywhere.',
    ],
    techStack: ['ESP32', 'C++', 'NimBLE / BLE', 'MQTT', 'WiFi', 'DSP', 'React Native', 'Node.js', 'Next.js'],
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
      "Everything is physics: you grab, chop, and throw real objects with your hands across a modular gameplay system, while the networking keeps both players' kitchens perfectly in sync.",
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
          'It leans on the harder parts of XR: hand tracking, objects that hide behind your real furniture, anchors that stay put, and grabbing things from across the room.',
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
    'EDUSEI WORKSTATION v2.026',
    'Initializing system...',
    'Loading portfolio modules...',
    'System ready.',
    '',
    'Select a project or type a command:',
  ];
  if (typeof window !== 'undefined' && profileData.birthday) {
    const now = new Date();
    const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (mmdd === profileData.birthday) {
      lines.splice(1, 0, 'Happy birthday, Jalen! 🎉');
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
  'Personal Portfolio Website': 'personal-portfolio',
  'Musical Artist Website and Storefront': 'musical-artist-site',
  'ATLAS Job Search Platform': 'atlas-job-search',
  'Live Election Platform': 'live-election-platform',
  'NSBE UGA Live Election Platform': 'live-election-platform',
  'PrimeForge FPGA Prime Number Detector': 'primeforge-fpga',
  'PARMCO Bluetooth Motor Control System': 'parmco-ble-motor',
  'Übersicht Desktop Widget Suite': 'ubersicht-widgets',
  'PDMS Microfluidic Mixer': 'pdms-microfluidic-mixer',
  'Kitchen Chaos VR': 'kitchen-chaos-vr',
  'BreakBuddy': 'break-buddy',
  'VR Portfolio 2': 'vr-portfolio-2',
  'Virtual Reality Portfolio 2': 'vr-portfolio-2',
  'Smart Plant Watering Assistant': 'smart-plant-watering-assistant',
  'VR Portfolio 1': 'vr-portfolio-1',
  'Virtual Reality Portfolio 1': 'vr-portfolio-1',
  'Audio Tracking Car': 'audio-tracking-car',
  'LED Frequency Filter': 'led-frequency-filter',
  'MEMESat-1 Flight Software': 'memesat',
  'Website Development': 'website-development',
  'Creation and Development of Websites': 'website-development',
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
    id: 'personal-portfolio',
    title: 'Personal Portfolio Website',
    tagline: 'Immersive 3D workstation portfolio built with React Three Fiber.',
    period: 'January 2026 – Present',
    location: 'Athens, GA',
    github: 'https://github.com/jke48222/edusei-workstation',
    liveUrl: 'https://www.jalenedusei.com',
    category: 'web',
    techStack: ['React Three Fiber', 'Framer Motion', 'Tailwind CSS', 'Zustand', 'TypeScript', 'Vercel', 'PWA'],
    description: [
      "This is the site you're looking at. I wanted a portfolio that felt less like a PDF and more like walking up to my actual desk, so I built a 3D workstation you can explore, complete with a retro CRT terminal, plus a cleaner view for people who just want the facts.",
      "Under the hood it's React Three Fiber for the 3D, Framer Motion for the transitions, and a little custom theme engine so the whole thing can change its mood. The hard part wasn't any single piece. It was making the 2D and 3D worlds feel like the same place while holding a smooth 60 frames a second, even on a phone.",
      "I designed it in Figma, built it, and shipped it on Vercel. Start to finish, it's all mine.",
    ],
    relatedProjects: [
      { title: 'Musical Artist Website and Storefront', slug: 'musical-artist-site', period: 'May 2026 – Present' },
      { title: 'Freight Carrier Website', slug: 'freight-carrier-website', period: 'July 2026 – Present' },
      { title: 'Live Election Platform', slug: 'live-election-platform', period: 'March 2026 – April 2026' },
    ],
  },
  {
    id: 'musical-artist-site',
    title: 'Musical Artist Website and Storefront',
    tagline: 'Headless Next.js music site and e-commerce storefront on Shopify + Sanity.',
    period: 'May 2026 – Present',
    location: 'Athens, GA',
    category: 'web',
    github: 'https://github.com/jke48222/akilahmali',
    liveUrl: 'https://www.akilahmali.com',
    techStack: ['Next.js 16', 'React 19', 'TypeScript', 'Shopify Storefront API', 'Sanity CMS', 'Tailwind CSS', 'Klaviyo', 'Upstash Redis', 'Sentry', 'Vercel'],
    description: [
      'A full storefront and home base for a recording artist, somewhere fans can read, watch, and actually buy.',
      "It's a headless build: Next.js and React up front, Shopify quietly handling the commerce behind the scenes, and Sanity as the CMS so the artist can publish releases, shows, and lookbooks without touching code. New content goes live the moment it's saved.",
      'I also handled the unglamorous but important parts like email capture with rate limiting, error monitoring, and analytics, then shipped the whole thing on Vercel.',
    ],
    relatedProjects: [
      { title: 'Freight Carrier Website', slug: 'freight-carrier-website', period: 'July 2026 – Present' },
      { title: 'Live Election Platform', slug: 'live-election-platform', period: 'March 2026 – April 2026' },
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
    ],
  },
  {
    id: 'freight-carrier-website',
    title: 'Freight Carrier Website',
    shortTitle: 'Freight Carrier Site',
    tagline: 'Production Next.js site with git-backed TinaCMS and a token design system for an independent freight carrier.',
    period: 'July 2026 – Present',
    location: 'Athens, GA',
    category: 'web',
    liveUrl: 'https://www.kulenterprises.com',
    techStack: ['Next.js 15', 'React 19', 'TypeScript', 'TinaCMS', 'Tailwind CSS', 'Framer Motion', 'Resend', 'Blender', 'Vercel'],
    description: [
      'A production website for an independent freight carrier, with me as the whole team: design, engineering, and shipping. The client and I iterated through twelve candidate design directions before landing the one that fit, and I built it out as fifteen statically generated routes across services, driver recruiting, safety, quoting, and legal pages in Next.js 15, React 19, and TypeScript, unified by a token-based design system, self-hosted type, and Framer Motion.',
      "The rule underneath it all: no readable sentence ships hardcoded. Every page, service, FAQ, form, and legal document lives in a typed, git-backed TinaCMS collection, a token system fills shared business facts into any sentence, and centralized Copy and Prose renderers put it on screen — so the client can rewrite the entire site from a hosted editor without touching code.",
      "The motion starts with an opening brand film I produced in Blender, Higgsfield, and Final Cut Pro (VP9/WebM with an H.264 fallback for Safari) and carries through a fullscreen documentary player, a looping dashcam hero, an interactive service-area map, and digitally restored archival photography, with scroll reveals in pure CSS that honor prefers-reduced-motion. Site search scores the CMS content directly so results never go stale, four forms submit through rate-limited, honeypot-protected API routes that forward via Resend, and the interface meets WCAG AA.",
    ],
    relatedProjects: [
      { title: 'Musical Artist Website and Storefront', slug: 'musical-artist-site', period: 'May 2026 – Present' },
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
    ],
  },
  {
    id: 'live-election-platform',
    title: 'Live Election Platform',
    tagline: 'Presenter-paced realtime election system for 60–80 concurrent voters.',
    period: 'March 2026 – April 2026',
    location: 'for a campus engineering student organization',
    category: 'web',
    techStack: ['Next.js 14', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'WebSockets', 'SHA-256', 'Row-Level Security'],
    description: [
      'When a room of 60 to 80 people needs to vote live, things break in funny ways. Everyone submits at once, someone tries to vote twice, and the presenter loses control of the pace. This system fixes all three.',
      "It's a presenter-paced election: the host walks the room through each race, ballots show up in under a tenth of a second over websockets, and a little randomized timing keeps the server from getting hammered the instant voting opens.",
      'Stopping double-votes was the real puzzle. I fingerprint each device, enforce one vote per role down at the database level, and lock results behind row-level security, so the count people see is the count that actually happened.',
    ],
    relatedProjects: [
      { title: 'Musical Artist Website and Storefront', slug: 'musical-artist-site', period: 'May 2026 – Present' },
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
    ],
  },
  {
    id: 'primeforge-fpga',
    title: 'PrimeForge FPGA Prime Number Detector',
    shortTitle: 'PrimeForge FPGA',
    tagline: 'Verilog prime-detection system with VGA, SD, and DDR2 on a Xilinx FPGA.',
    period: 'January 2026 – May 2026',
    location: 'Advanced Digital Systems, CSEE 4280',
    category: 'hardware',
    gallery: [
      { src: '/media/primeforge-monitor.jpg', alt: 'PrimeForge VGA output: self-check and last-20-primes readout' },
      { src: '/media/primeforge-board.jpg', alt: 'Nexys A7 FPGA with PMOD joystick, keypad, and VGA output' },
    ],
    techStack: ['Verilog', 'Xilinx FPGA', 'VGA', 'SPI', 'DDR2', 'Digital Design'],
    description: [
      'PrimeForge is a prime-number engine built straight in hardware. No operating system, no processor running C, just Verilog on an FPGA doing the math in parallel.',
      'Two engines race under the hood: a classic Sieve of Eratosthenes and a trial-division core, switchable at runtime depending on whether you want raw speed or a lighter footprint.',
      "It's a whole little computer: a from-scratch VGA pipeline draws the results on screen, an SD card holds the reference data, DDR2 memory backs the frame buffer, and you drive the menus with a joystick, keypad, and buttons.",
    ],
    relatedProjects: [
      { title: 'PARMCO Bluetooth Motor Control System', slug: 'parmco-ble-motor', period: 'January 2026 – May 2026' },
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
    techStack: ['C', 'Raspberry Pi 4', 'BLE', 'SwiftUI', 'Core Bluetooth', 'ARMv8 Assembly', 'pigpio', 'systemd'],
    description: [
      'PARMCO lets you control a physical motor from your iPhone over Bluetooth. Pick a direction, dial in a speed, and watch the live RPM stream back to the app.',
      'The Raspberry Pi runs a Bluetooth server I wrote in C, reaching down to the hardware with a mix of ARM assembly and DMA-driven PWM to actually spin the motor.',
      'It can also hold a target speed on its own: a closed loop reads an optical tachometer and constantly trims the power to keep the RPM locked where you set it. A SwiftUI app ties it all together with manual and automatic modes.',
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
    location: 'Athens, GA',
    category: 'web',
    github: 'https://github.com/jke48222/widget-suite',
    tileMedia: { kind: 'video', src: '/media/ubersicht-home.mp4', poster: '/media/ubersicht-home-poster.jpg', alt: 'Übersicht widget suite running on a macOS desktop' },
    gallery: [
      'animated-wallpaper', 'now-playing', 'spinning-globe', 'daily-astronomy-photo',
      'rotating-3d-model', 'recent-album-covers', 'daily-tarot', 'github-contributions',
      'clipboard-history', 'daily-ai-prompt', 'recent-downloads', 'wallpaper-switcher',
    ].map((n) => ({ src: `${GH_RAW}/widget-suite/main/thumbs/${n}.png`, alt: `${n.replace(/-/g, ' ')} widget` })),
    techStack: ['React', 'JSX', 'WebGL', 'Shell', 'Claude API', 'Design Systems'],
    description: [
      'Twelve little desktop widgets for macOS that turn an empty desktop into something alive: a now-playing vinyl record, a spinning globe of places I\'ve been, a live shader wallpaper, NASA\'s photo of the day, a daily AI prompt, and more.',
      'They all share one design system, so twelve separate projects still feel like a set: the same frosted-glass cards, the same type, the same drag-and-resize, and offline fallbacks so nothing looks broken when the wifi drops.',
      'Each one ships as its own GitHub repo with a one-line install script, designed, built, documented, and released end to end.',
    ],
    relatedProjects: [
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
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
  {
    id: 'atlas-job-search',
    title: 'ATLAS Job Search Platform',
    shortTitle: 'ATLAS',
    tagline: 'AI-powered job-search OS with a Kanban pipeline and Claude-powered tooling.',
    period: 'April 2026',
    location: 'Athens, GA',
    category: 'ai',
    techStack: ['React', 'TypeScript', 'Anthropic Claude API', 'LLM Tool Use', 'Charts', 'REST'],
    description: [
      'ATLAS is the job-search tool I wished existed, so I built it. Everything from first cold email to final offer lives on one Kanban board instead of scattered across spreadsheets and browser tabs.',
      'The interesting part is the AI. It tailors résumés, drafts cover letters and outreach, researches companies, runs mock interviews, and compares offers, all powered by the Claude API.',
      'An analytics layer tracks how fast applications move and where they stall, so the search runs on data instead of vibes.',
    ],
    relatedProjects: [
      { title: 'Musical Artist Website and Storefront', slug: 'musical-artist-site', period: 'May 2026 – Present' },
      { title: 'Personal Portfolio Website', slug: 'personal-portfolio', period: 'January 2026 – Present' },
    ],
  },
];

/**
 * Slugs of the curated projects surfaced as "Selected Work" cards on the
 * professional view and the Timeline. Decoupled from the 3D workstation
 * objects (which remain the five projectsData entries). Order is the display order.
 */
export const FEATURED_IDS = [
  'animaldot',
  'personal-portfolio',
  'freight-carrier-website',
  'musical-artist-site',
  'atlas-job-search',
  'live-election-platform',
  'primeforge-fpga',
  'parmco-ble-motor',
  'kitchen-chaos-vr',
  'memesat',
  'ubersicht-widgets',
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
      techStack: ['Raspberry Pi Pico 2W', 'Sensors', 'Kalman Filtering', 'Signal Conditioning'],
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
      techStack: ['Circuit Design', 'Signal Processing', 'Oscilloscope'],
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
  'pdms-microfluidic-mixer': 'research',
  'kitchen-chaos-vr': 'vr',
  'vr-portfolio-1': 'vr',
  'vr-portfolio-2': 'vr',
  'personal-portfolio': 'web',
  'freight-carrier-website': 'web',
  'musical-artist-site': 'web',
  'live-election-platform': 'web',
  'ubersicht-widgets': 'web',
  'website-development': 'web',
  'travel-itinerary-application': 'web',
  'atlas-job-search': 'ai',
  'break-buddy': 'research',
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
  
  // AI app — animated spinning globe instead of a static icon
  'atlas-job-search': { kind: 'globe' },

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
  '  help     - Display this message',
  '  list     - List all projects',
  '  run [name] - Open a project (e.g. run audiocar)',
  '  theme [name] - Switch theme (e.g. theme light, theme bulldogred)',
  '  about    - About Jalen Edusei',
  '  skills   - View technical skills',
  '  resume   - Download resume',
  '  cv       - Download CV',
  '  clear    - Clear terminal',
  '',
  'Click any project to view details.',
];
