import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CornerDownLeft } from "lucide-react";
import { getAllProjectsForWork } from "../../data";

type Item = { label: string; hint: string; kind: "section" | "project" | "page"; go: () => void };

/** Search button + command-palette overlay: jump to a section, project, or the workstation. */
export default function LandingSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const items = useMemo<Item[]>(() => {
    const scrollTo = (id: string) => () => {
      setOpen(false);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const sections: Item[] = [
      { label: "Selected Work", hint: "section", kind: "section", go: scrollTo("work") },
      { label: "Skills", hint: "section", kind: "section", go: scrollTo("skills") },
      { label: "Experience", hint: "section", kind: "section", go: scrollTo("experience") },
      { label: "Recognition", hint: "section", kind: "section", go: scrollTo("recognition") },
      { label: "About", hint: "section", kind: "section", go: scrollTo("about") },
      { label: "Contact", hint: "section", kind: "section", go: scrollTo("contact") },
      { label: "3D Workstation", hint: "page", kind: "page", go: () => { setOpen(false); navigate("/workstation"); } },
      { label: "All work", hint: "page", kind: "page", go: () => { setOpen(false); navigate("/work"); } },
    ];
    const projects: Item[] = getAllProjectsForWork().map((p) => ({
      label: p.title,
      hint: p.category ?? "project",
      kind: "project",
      go: () => { setOpen(false); navigate(`/work/${p.id}`); },
    }));
    return [...sections, ...projects];
  }, [navigate]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items.slice(0, 8);
    return items.filter((i) => i.label.toLowerCase().includes(needle) || i.hint.toLowerCase().includes(needle)).slice(0, 10);
  }, [q, items]);

  useEffect(() => { setActive(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); results[active]?.go(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open, results, active]);

  // Global ⌘K / Ctrl-K shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Search (⌘K)"
        title="Search (⌘K)"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white/60 text-ink backdrop-blur transition-colors hover:bg-white"
      >
        <Search className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 px-4 pt-[18vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
              <Search className="h-4 w-4 text-ink-mute" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search work, skills, sections…"
                className="w-full bg-transparent py-4 text-[15px] text-ink outline-none placeholder:text-ink-mute"
              />
              <kbd className="hidden rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-ink-mute sm:block">esc</kbd>
            </div>
            <ul className="max-h-[44vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-ink-mute">No matches.</li>
              )}
              {results.map((r, i) => (
                <li key={r.kind + r.label}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={r.go}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === active ? "bg-ink text-white" : "text-ink hover:bg-black/5"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`font-display text-[14px] tracking-[-0.02em]`}>{r.label}</span>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${i === active ? "text-white/55" : "text-ink-mute"}`}>{r.hint}</span>
                    </span>
                    {i === active && <CornerDownLeft className="h-3.5 w-3.5 opacity-70" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
