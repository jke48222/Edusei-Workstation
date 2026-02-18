/**
 * @file data.ts
 * @description Central data module: profile, skills, work experience, leadership,
 * projects, and terminal/help copy. All content consumed by professional view
 * and immersive overlay. Exports typed interfaces and lookup helpers.
 */

import type { ViewState } from './store/store.ts';

/**
 * Project data interface (aligns with ViewState for 3D object mapping).
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

/**
 * Profile information
 */
export const profileData = {
  name: 'Jalen Edusei',
  title: 'Software Engineer',
  university: 'University of Georgia',
  college: 'College of Engineering, Morehead Honors College',
  degree: 'B.S. Computer Systems Engineering',
  graduationYear: 2026,
  email: 'jalen.edusei@gmail.com',
  phone: '770.714.0190',
  linkedin: 'linkedin.com/in/jalenedusei',
  github: 'github.com/jke48222',
  resumeUrl: '/resume.pdf',
  openForWork: true,
  /** MM-DD for time-based boot message (e.g. '09-28' for September 28). */
  birthday: '09-28',
};

/**
 * Pre-filled "Say hi" mailto URL (subject + body) for portfolio contact.
 * Use for Get in touch, Contact section, and overlay Email link.
 */
export function getSayHiMailto(): string {
  const subject = encodeURIComponent(`Portfolio – Say hi from ${profileData.name}`);
  const body = encodeURIComponent(
    `Hi ${profileData.name},\n\nI came across your portfolio and wanted to reach out.\n\n`
  );
  return `mailto:${profileData.email}?subject=${subject}&body=${body}`;
}

/**
 * Skills organized by category
 */
export const skillsData = {
  programming: [
    'Assembly', 'C', 'C#', 'C++', 'HTML', 'Java', 'JavaFX', 
    'JavaScript', 'MATLAB', 'Python', 'R', 'SQL', 'Verilog'
  ],
  software: [
    'Autodesk Fusion 360', 'Blender', 'CAD', 'Figma', 'Git', 
    'GitHub', 'Graphic Design', 'NASA F Prime', 'Unity3D', 'VR/MR Development',
    'Website Development', 'Xilinx', 'Zephyr', 'Microsoft Suite', 'WordPress', 'Wix'
  ],
  hardware: [
    '2U CubeSat', 'Basys2 FPGA Boards', 'Raspberry Pi Pico 2W',
    'Raspberry Pi 4', 'Sensors', 'Signal Processing', 
    'STM32 Microcontrollers'
  ],
  core: [
    'Business Case Development', 'Collaboration', 'Data Analysis', 'Critical Thinking',
    'Human-Computer Interaction', 'Problem Solving', 'Product Strategy',
    'Project Management', 'Strategic Leadership', 'Technical Communication'
  ],
};

/**
 * Work Experience
 */
export const workExperience = [
  {
    title: 'Business Analyst Intern',
    company: 'Capital One',
    location: 'McLean, VA',
    period: 'June 2025 – August 2025',
    highlights: [
      'Spearheaded development of a business case for a Notifications Preferences Center for CreditWise, projected to streamline customer communication management for 60M+ users.',
      'Analyzed performance of CreditWise email campaigns, creating a valuation framework to quantify engagement and retention impact.',
      'Partnered with cross-functional teams to present actionable recommendations to senior leadership.',
      'Leveraged SQL, Python, Excel, and data visualization tools to evaluate KPIs.',
    ],
  },
  {
    title: 'Resident Assistant',
    company: 'University of Georgia Housing',
    location: 'Athens, GA',
    period: 'August 2023 – May 2025',
    highlights: [
      'Cultivated an inclusive community for 45 residents by organizing 10+ educational and social events each semester.',
      'Mediated and resolved 30+ conflicts and safety concerns.',
      'Partnered with housing staff to implement programming focused on academic success and mental health.',
    ],
  },
  {
    title: 'Research Assistant',
    company: 'Joyner Research Laboratory',
    location: 'Athens, GA',
    period: 'September 2022 – May 2023',
    highlights: [
      'Designed and launched a new laboratory website, increasing research visibility by 500+ monthly visitors.',
      'Conducted 50+ experiments including ELISAs and DNA/RNA extractions.',
      'Analyzed data contributing to 2 peer-reviewed manuscripts.',
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

/**
 * Leadership & Involvement
 */
export const leadership = [
  {
    role: 'Vice President',
    organization: 'National Society of Black Engineers',
    period: 'May 2025 – Present',
    highlights: [
      'Lead a 100+ member chapter in strategic planning, aligning operations with national initiatives.',
      'Coordinate logistics for national and regional conventions, managing travel for 50+ members.',
      'Design and implement a centralized digital resource hub for internship pipelines and alumni contacts.',
    ],
  },
  {
    role: 'Member',
    organization: 'Tau Beta Pi Honor Society',
    period: 'October 2024 – Present',
  },
  {
    role: 'Brother',
    organization: 'Theta Tau Fraternity, Iota Epsilon Chapter',
    period: 'January 2024 – Present',
  },
  {
    role: 'Student Advisor',
    organization: 'Louis Stokes Alliance for Minority Participation',
    period: 'August 2023 – May 2025',
    highlights: [
      'Planned and executed 8+ workshops each semester supporting academic success for 30+ underrepresented STEM students.',
      'Assisted in strategic programming and mentoring initiatives contributing to increased retention and engagement.',
    ],
  },
  {
    role: 'Senator',
    organization: 'National Society of Black Engineers',
    period: 'May 2024 – May 2025',
    highlights: [
      'Represented chapter at regional and national levels, voting on legislation and advocating for student-centered initiatives.',
      'Led conference interest meetings, managing all travel logistics and budget allocations.',
      'Drafted and presented semester goals fostering alignment between chapter activities and national objectives.',
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
    organization: 'National Society of Black Engineers',
    period: 'May 2023 – May 2024',
    highlights: [
      'Increased chapter social media engagement by 40% through data-driven content strategies.',
      'Designed and launched a new chapter website to streamline communication and showcase events.',
      'Created branded promotional materials that boosted event attendance by 15%.',
    ],
  },
];

/**
 * Study Abroad
 */
export const studyAbroad = {
  title: 'Study Abroad in Germany',
  period: 'May 2023 – June 2023',
  highlights: [
    'Completed coursework on engineering ethics, professionalism, and global collaboration, earning 3 credit hours.',
    'Delivered 3 technical presentations and authored 2 academic papers exploring case studies in ethical engineering practice.',
    'Traveled independently to Germany, France, and Austria, building intercultural fluency and adaptability.',
  ],
};

/**
 * Honors & Awards
 */
export const honors = [
  { title: 'Extraordinary Engineer', org: 'College of Engineering', date: 'February 2024' },
  { title: 'Presidential Scholar (2x)', org: 'University of Georgia', date: '2022-2023' },
];

/**
 * Main projects data - each corresponds to a 3D object
 */
export const projectsData: ProjectData[] = [
  {
    id: 'car',
    executable: 'audiocar',
    title: 'Audio Tracking Car',
    tagline: 'Autonomous audio-frequency navigation system',
    period: 'January 2025 – April 2025',
    location: 'ECSE Design Methodology',
    objectLabel: 'Car',
    accentColor: '#ff6b35',
    github: 'https://github.com/jke48222/Audio-Tracking-Car',
    description: [
      'Engineered a Python-based control system on Raspberry Pi 4 that autonomously navigated towards specific audio frequencies, improving tracking precision by 20%.',
      'Developed a PID motor control algorithm utilizing optical encoder feedback and ADC signal processing, enhancing motor response time by 15%.',
      'Directed GitHub codebase with 200+ commits and launched a Wix user manual site accessed by 50+ users.',
    ],
    techStack: ['Python', 'Raspberry Pi 4', 'PID Control', 'ADC Processing', 'Git'],
    additionalProjects: [
      {
        title: 'LED Frequency Filter',
        period: 'August 2024 – December 2024',
        description: [
          'Designed a frequency filter circuit to classify signals into predefined bands via LEDs, achieving 98% accuracy.',
          'Iterated hardware design through oscilloscope analysis, improving reliability by 10%.',
        ],
      },
      {
        title: 'Smart Plant Watering Assistant',
        period: 'August 2025 – November 2025',
        description: [
          'Built automated plant monitoring using Raspberry Pi Pico 2W with soil moisture sensor, thermistor, and LDR.',
          'Integrated Kalman filtering and transistor-driven water pump with predictive thresholding.',
        ],
      },
    ],
  },
  {
    id: 'dog',
    executable: 'animaldot',
    title: 'AnimalDot',
    tagline: 'Contactless smart sensing bed for animal vitals',
    period: 'August 2025 – Present',
    location: 'Capstone Design, CSEE 4910',
    objectLabel: 'Dog',
    accentColor: '#4ecdc4',
    description: [
      'Designing a contactless smart sensing bed to monitor animal heart rate and respiration using geophone-based vibration sensing.',
      'Developing a modular sensing pipeline integrating geophones, load cells, and temperature sensors with analog signal conditioning.',
      'Architecting an embedded-to-mobile system for real-time visualization and caregiver-facing health insights.',
    ],
    techStack: ['Geophones', 'Load Cells', 'Signal Processing', 'Embedded Systems', 'Mobile Dev'],
    additionalProjects: [
      {
        title: 'BreakBuddy',
        period: 'August 2025 – December 2025',
        description: [
          'Designed a guilt-free stress management app for educators with guided micro-break sessions.',
          'Conducted user research through interviews, affinity mapping, and iterative heuristic evaluation.',
          'Built high-fidelity prototypes with activity timer, defensive design, and Reports dashboard.',
        ],
      },
    ],
  },
  {
    id: 'vr',
    executable: 'kitchenchaos',
    title: 'Kitchen Chaos VR',
    tagline: 'Immersive multiplayer VR experiences on Quest 3',
    period: 'October 2025 – December 2025',
    location: 'Virtual Reality, CSCI 6830',
    objectLabel: 'Quest 3',
    accentColor: '#a855f7',
    github: 'https://github.com/jke48222/VR-Final-Project',
    description: [
      'Built an Overcooked-style multiplayer VR cooking game for Meta Quest 3 in Unity with physics-driven interactions.',
      'Integrated VelNet networking for player avatar sync, spawning, and round state across clients.',
      'Developed recipe/scoring pipeline using ScriptableObjects and AI dish judge via REST API with TTS narration.',
    ],
    techStack: ['Unity3D', 'C#', 'Meta Quest 3', 'VelNet', 'OpenXR', 'Meta XR SDK', 'REST APIs'],
    additionalProjects: [
      {
        title: 'VR Portfolio 2',
        period: 'October 2025 – November 2025',
        github: 'https://github.com/jke48222/VR-Portfolio-2',
        description: [
          'Developed Quest 3 XR environments with spatial audio, physics, and hand-tracking using Unity URP, OpenXR, and Meta SDK.',
          'Implemented MR mechanics including occlusion, passthrough, anchors, and haptics via a modular system of 20+ C# scripts.',
          'Built a Wit.ai NPC with NLU and lip-syncing to enable voice-controlled panels and dynamic XR interactions.',
        ],
      },
      {
        title: 'VR Portfolio 1',
        period: 'August 2025 – October 2025',
        github: 'https://github.com/jke48222/VR-Portfolio-1',
        description: [
          'Constructed four-part Unity portfolio demonstrating transformation, physics, immersion, and interaction.',
          'Authored 15+ C# scripts with real-time lighting, spatial audio, and smooth locomotion.',
          'Achieved 40% longer user focus through sensory cue experimentation.',
        ],
      },
    ],
  },
  {
    id: 'satellite',
    executable: 'memesat',
    title: 'MEMESat-1 Flight Software',
    tagline: 'CubeSat software for NASA space mission',
    period: 'March 2024 – December 2024',
    location: 'Small Satellite Research Laboratory',
    objectLabel: 'CubeSat',
    accentColor: '#06b6d4',
    description: [
      'Developed CubeSat flight software in C++ using NASA F Prime framework on Raspberry Pi Compute Module 4.',
      'Achieved 90% line coverage and 60% branch coverage through comprehensive verification suite.',
      'Collaborated with cross-functional team to deploy custom Linux-based environment for satellite integration.',
    ],
    techStack: ['C++', 'NASA F Prime', 'Raspberry Pi CM4', 'Linux', 'Embedded Systems', 'Verification'],
    additionalProjects: [
      {
        title: 'Website Development',
        period: 'September 2022 – May 2024',
        description: [
          'Spearheaded WordPress and JavaScript website development for Joyner Lab and NSBE.',
          'Coordinated with 10+ stakeholders applying UX principles for multi-device compatibility.',
          'Implemented testing protocols reducing bugs and downtime by 30%.',
        ],
      },
      {
        title: 'Travel Itinerary Application',
        period: 'December 2023',
        description: [
          'Created JavaFX GUI integrating Google Places and RESTful APIs for hotels, attractions, restaurants.',
          'Engineered background threading for smooth UI responsiveness, improving usability by 25%.',
        ],
      },
    ],
  },
  {
    id: 'tablet',
    executable: 'capitalone',
    title: 'Capital One Internship',
    tagline: 'Business Analyst - CreditWise 60M+ users',
    period: 'June 2025 – August 2025',
    location: 'McLean, VA',
    objectLabel: 'Capital One',
    accentColor: '#ef4444',
    description: [
      'Spearheaded business case for Notifications Preferences Center for CreditWise, impacting 60M+ users.',
      'Analyzed CreditWise email campaigns, creating valuation framework for engagement and retention.',
      'Presented actionable recommendations to senior leadership, driving messaging strategy alignment.',
      'Leveraged SQL, Python, Excel, and data visualization tools to evaluate KPIs and inform product roadmap.',
    ],
    techStack: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Business Analysis', 'Product Strategy'],
  },
];

/**
 * Terminal boot sequence. Returns lines with optional birthday message when today matches profileData.birthday (MM-DD).
 */
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

/**
 * ASCII art header - using simple ASCII for perfect alignment
 */
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

/**
 * Get project by ID
 */
export const getProjectById = (id: ViewState): ProjectData | undefined => {
  return projectsData.find(project => project.id === id);
};

/**
 * Help text for terminal
 */
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
