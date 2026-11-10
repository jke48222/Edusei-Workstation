/**
 * Code shown by the landing page's IDE preview when a visitor switches a file to Code.
 *
 * The three client sites live in private repositories, so their entries are sketches:
 * short scripts written for this page that show what each site does, not the sites'
 * source. They are marked `sketch` and the Code view labels them that way. Otto's
 * repository is public, so its entry is a verbatim excerpt at the commit named beside
 * it, with a link to the lines.
 */
export interface PreviewCode {
  /** Project slug in ../../data. */
  id: string;
  /** File name shown in the title bar. For an excerpt, the path inside the repository. */
  path: string;
  lang: "ts" | "swift";
  /** True when the code was written for this page and is not the project's source. */
  sketch?: boolean;
  /** Excerpts only: line number of the first line in that file. */
  startLine?: number;
  /** Excerpts only: short SHA the excerpt was copied at. */
  commit?: string;
  code: string;
  /** Excerpts only: link to the lines in the public repository. */
  href?: string;
}

export const PREVIEW_CODE: PreviewCode[] = [
  {
    "id": "musical-artist-site",
    "path": "control-room.ts",
    "lang": "ts",
    "sketch": true,
    "code": "// Seven monitors, seven tracks. Click one and the camera flies to it.\nconst feeds: Feed[] = [\n  { title: \"Last Year\", accent: \"#3b4cff\" },\n  { title: \"My Bed\", accent: \"#d8c9a3\" },\n  { title: \"Gone Away\", accent: \"#1f9d6b\" },\n  { title: \"Been There Once\", accent: \"#e0564f\" },\n  { title: \"Who Really Won?\", accent: \"#b24bd6\" },\n];\n\nexport async function openFeed(room: ControlRoom, index: number) {\n  const feed = feeds[index];\n  await room.camera.flyTo(room.monitor(index), { seconds: 1.6 });\n  room.showTrack(feed); // full-screen title, photo and streaming links\n  room.audio.play(feed.title);\n}\n\nexport function onKey(room: ControlRoom, key: string, current: number) {\n  const last = feeds.length - 1;\n  if (key === \"ArrowRight\") return openFeed(room, current === last ? 0 : current + 1);\n  if (key === \"ArrowLeft\") return openFeed(room, current === 0 ? last : current - 1);\n  if (key === \"Escape\") return room.camera.flyHome();\n}"
  },
  {
    "id": "freight-carrier-website",
    "path": "quote-request.ts",
    "lang": "ts",
    "sketch": true,
    "code": "// A freight quote request: check it, limit repeats, then email dispatch.\ntype QuoteRequest = {\n  origin: string;\n  destination: string;\n  freight: \"dry-van\" | \"reefer\" | \"power-only\";\n  pickup: string;\n  contact: string;\n};\n\nexport async function submitQuote(form: QuoteRequest, ip: string) {\n  const missing = REQUIRED.filter((field) => !form[field].trim());\n  if (missing.length > 0) return { ok: false, error: `Missing: ${missing.join(\", \")}` };\n\n  // Five requests per address every ten minutes keeps the form from being flooded.\n  if (!allow(ip, { max: 5, perMinutes: 10 })) return { ok: false, error: \"Too many requests\" };\n\n  await email.send({\n    to: \"dispatch\",\n    subject: `Quote: ${form.origin} to ${form.destination}`,\n    body: summarize(form),\n  });\n  return { ok: true };\n}"
  },
  {
    "id": "cake-artista",
    "path": "assistant-card.ts",
    "lang": "ts",
    "sketch": true,
    "code": "// The site assistant can do one thing besides talk: show a card.\n// Every card is checked against the real catalog before a visitor sees it.\ntype Card = { kind: \"kit\" | \"class\" | \"consult\"; id: string };\n\nexport function showCard(card: Card, catalog: Catalog) {\n  const item = catalog[card.kind].find((entry) => entry.id === card.id);\n  if (!item) return { shown: false, reason: \"No such item on the site\" };\n\n  return {\n    shown: true,\n    title: item.title,\n    price: item.price,\n    // Adding to the cart or booking still takes the visitor's own tap.\n    action: card.kind === \"consult\" ? \"Pick a time\" : \"Add to cart\",\n  };\n}"
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
