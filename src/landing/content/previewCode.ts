/**
 * Source shown by the landing page's IDE preview when a visitor switches a file to Code.
 * Each excerpt is copied verbatim from the project's repository at the commit named beside
 * it, so the lines here are lines that run in production. The three client repositories
 * are private, which is why only Otto's excerpt carries a link.
 */
export interface PreviewCode {
  /** Project slug in ../../data. */
  id: string;
  /** File path inside the project's repository. */
  path: string;
  lang: "ts" | "swift";
  /** Line number of the excerpt's first line in that file. */
  startLine: number;
  /** Short SHA the excerpt was copied at. */
  commit: string;
  code: string;
  /** Set only when the repository is public. */
  href?: string;
}

export const PREVIEW_CODE: PreviewCode[] = [
  {
    "id": "musical-artist-site",
    "path": "src/components/wrw/grid/GridScene.tsx",
    "lang": "ts",
    "startLine": 38,
    "commit": "a3cee2c",
    "code": "function focusFor(feed: Feed, fov: number, aspect: number) {\n  const t = Math.tan((fov * Math.PI) / 180 / 2);\n  const distH = SCREEN_SIZE[1] / (2 * t);\n  const distW = SCREEN_SIZE[0] / (2 * t * aspect);\n  const dist = Math.min(distH, distW) * 0.96;\n  const nrm = new THREE.Vector3(Math.sin(feed.rotY), 0, Math.cos(feed.rotY)).normalize(); // plane normal (-x-ish)\n  const pos = new THREE.Vector3(...feed.pos).add(nrm.multiplyScalar(dist));\n  return { pos, look: new THREE.Vector3(...feed.pos) };\n}\n\nfunction homeFor(aspect: number) {\n  let fov = 48;\n  let back = 0;\n  const target = HOME_TARGET.clone();\n  // On portrait/mobile the bank otherwise sits tiny in a sea of empty room, so\n  // pull the camera IN (smaller back) and tighten the FOV so the monitors fill\n  // the frame while still keeping all 7 monitors in view.\n  if (aspect < 0.6) {\n    fov = 64;\n    back = 0.7;\n  } else if (aspect < 0.85) {\n    fov = 54;\n    back = 0.0;\n  } else if (aspect < 1.2) {\n    fov = 50;\n    back = 0.3;\n  }\n  const dir = HOME_POS.clone().sub(HOME_TARGET).normalize();\n  return { pos: HOME_POS.clone().add(dir.multiplyScalar(back)), fov, target };\n}"
  },
  {
    "id": "freight-carrier-website",
    "path": "lib/ratelimit.ts",
    "lang": "ts",
    "startLine": 24,
    "commit": "f3db742",
    "code": "export function rateLimit(\n  key: string,\n  max = 5,\n  windowMs = 10 * 60 * 1000\n): { allowed: boolean } {\n  const now = Date.now();\n  const windowStart = now - windowMs;\n\n  const stamps = (hits.get(key) ?? []).filter((t) => t > windowStart);\n  hits.delete(key);\n  if (hits.size >= MAX_KEYS) {\n    const oldest = hits.keys().next().value;\n    if (oldest !== undefined) hits.delete(oldest);\n  }\n\n  if (stamps.length >= max) {\n    hits.set(key, stamps);\n    return { allowed: false };\n  }\n  stamps.push(now);\n  hits.set(key, stamps);\n  return { allowed: true };\n}"
  },
  {
    "id": "cake-artista",
    "path": "lib/sandrita/match.ts",
    "lang": "ts",
    "startLine": 19,
    "commit": "e64bf16",
    "code": "/**\n * Each phrase found adds 2 and each whole word adds 1. The highest score wins; a tie goes to the\n * intent listed first in INTENT_PRIORITY, and a score of 0 means fallback.\n */\nexport function detectIntent(input: string): SandritaIntent {\n  const text = normalize(input);\n  if (text === \"\") return \"fallback\";\n  const padded = ` ${text} `;\n  const words = new Set(text.split(\" \"));\n\n  let best: SandritaIntent = \"fallback\";\n  let bestScore = 0;\n  for (const intent of INTENT_PRIORITY) {\n    const entry = SANDRITA.intents[intent];\n    let score = 0;\n    for (const phrase of entry.phrases) if (padded.includes(` ${phrase} `)) score += 2;\n    for (const word of entry.words) if (words.has(word)) score += 1;\n    if (score > bestScore) {\n      best = intent;\n      bestScore = score;\n    }\n  }\n  return best;\n}"
  },
  {
    "id": "otto",
    "path": "Otto/Tools/ToolRateLimiter.swift",
    "lang": "swift",
    "startLine": 39,
    "commit": "bac9ed7",
    "code": "/// nil = allowed (and counted). Counts per tool name per turn and per rolling hour. (The 25-calls-per-reply\n/// cap, `ToolLimits.maxCallsPerTurn`, is enforced by the loop.) A refused call isn't counted.\nfunc check(_ tool: any OttoTool) -> ToolError? {\n    let limit = tool.rateLimit\n    let now = clock()\n    let windowStart = now.addingTimeInterval(-Self.hourWindow)\n    let recent = (hourlyRuns[tool.name] ?? []).filter { $0 > windowStart }\n    hourlyRuns[tool.name] = recent\n\n    let usedThisTurn = turnCounts[tool.name] ?? 0\n    let overTurn = usedThisTurn >= limit.perTurn\n    let overHour = limit.perHour.map { recent.count >= $0 } ?? false\n    guard !overTurn, !overHour else { return Self.limitError(toolName: tool.name, limit: limit) }\n\n    turnCounts[tool.name] = usedThisTurn + 1\n    hourlyRuns[tool.name] = recent + [now]\n    return nil\n}",
    "href": "https://github.com/jke48222/otto/blob/bac9ed7/Otto/Tools/ToolRateLimiter.swift#L39-L56"
  }
];
