import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { getIdeProject, IDE_PROJECTS, LANG_LABELS, type IdeProject } from "../../../components/ide/projectRegistry";
import { ProjectMedia } from "../../../components/work/ui/ProjectMedia";
import { PREVIEW_CODE, type PreviewCode } from "../../content/previewCode";
import { useInView } from "../../lib/hooks";
import { ArrowUpRight } from "../ui";

/**
 * A miniature of the real workstation. The explorer lists four shipped projects by the
 * file the IDE gives them, and each opens two ways, as an editor does for a document:
 * Preview is the live site (or Otto's recorded window, since ottonotch.com refuses
 * framing), Code is a verbatim excerpt of that project's source.
 */

const ADVANCE_MS = 6500;
type View = "preview" | "code";

interface Entry {
  file: IdeProject;
  code: PreviewCode;
  /** Bare host of the live site, e.g. `kulenterprises.com`. */
  host: string;
}

function hostOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/* ---------------------------- syntax colouring ---------------------------- */

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "of", "in", "new", "export", "import", "from",
  "type", "true", "false", "nil", "null", "undefined", "func", "guard", "static", "private", "self", "Self", "continue",
]);
// One pass per line: comment, string, number, word. Anything else is plain text.
const TOKEN = /(\/\/.*$|\/\*.*?\*\/|\/\*.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)/g;

function paint(line: string, inBlock: boolean): { nodes: ReactNode[]; inBlock: boolean } {
  if (inBlock) {
    const end = line.indexOf("*/");
    if (end === -1) return { nodes: [<span key="c" className="text-dark-ink-mute">{line}</span>], inBlock: true };
    const rest = paint(line.slice(end + 2), false);
    return { nodes: [<span key="c" className="text-dark-ink-mute">{line.slice(0, end + 2)}</span>, ...rest.nodes], inBlock: rest.inBlock };
  }
  const nodes: ReactNode[] = [];
  let last = 0;
  let open = false;
  for (const m of line.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) nodes.push(line.slice(last, at));
    const [text, comment, str, num, word] = m;
    if (comment) {
      nodes.push(<span key={at} className="text-dark-ink-mute">{text}</span>);
      open = comment.startsWith("/*") && !comment.endsWith("*/");
    } else if (str || num) {
      nodes.push(<span key={at} className="text-[#E8C89A]">{text}</span>);
    } else if (word && KEYWORDS.has(word)) {
      nodes.push(<span key={at} className="font-medium text-dark-ink">{text}</span>);
    } else {
      nodes.push(text);
    }
    last = at + text.length;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return { nodes, inBlock: open };
}

function CodePane({ code }: { code: PreviewCode }) {
  const rows = useMemo(() => {
    let inBlock = false;
    return code.code.split("\n").map((line) => {
      const painted = paint(line, inBlock);
      inBlock = painted.inBlock;
      return painted.nodes;
    });
  }, [code]);
  const source = `${code.path} · from line ${code.startLine} · ${code.commit}`;
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0b0b0c]">
      <div className="min-h-0 flex-1 overflow-auto py-3 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin]" tabIndex={0} aria-label={`Source excerpt from ${code.path}`}>
        <pre className="w-max min-w-full text-[11.5px] leading-[1.65] text-dark-ink-dim">
          {rows.map((nodes, i) => (
            <div key={i} className="flex pr-4">
              <span aria-hidden className="w-11 shrink-0 select-none pr-3 text-right text-dark-ink-mute/70">{code.startLine + i}</span>
              <code className="whitespace-pre">{nodes.length ? nodes : " "}</code>
            </div>
          ))}
        </pre>
      </div>
      <p className="truncate border-t border-[var(--dark-line)] px-4 py-1.5 text-[10.5px] text-dark-ink-mute">
        {code.href ? (
          <a href={code.href} target="_blank" rel="noreferrer" className="underline decoration-white/25 underline-offset-2 hover:text-dark-ink">{source}</a>
        ) : (
          <>{source} · private repository</>
        )}
      </p>
    </div>
  );
}

/* --------------------------------- widget --------------------------------- */

export default function IdePreview() {
  const entries = useMemo<Entry[]>(
    () =>
      PREVIEW_CODE.flatMap((code) => {
        const file = getIdeProject(code.id);
        return file ? [{ file, code, host: hostOf(file.liveUrl) }] : [];
      }),
    []
  );
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [active, setActive] = useState(0);
  const [view, setView] = useState<View>("preview");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!inView || pinned || view === "code" || entries.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % entries.length), ADVANCE_MS);
    return () => clearInterval(id);
  }, [inView, pinned, view, entries.length]);

  const current = entries[active];
  if (!current) return null;
  const { file, code, host } = current;
  const pick = (i: number) => { setActive(i); setPinned(true); };
  const tab = (v: View, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === v}
      onClick={() => { setView(v); setPinned(true); }}
      className={`rounded-md px-2.5 py-1 transition-colors ${view === v ? "bg-white/[0.14] text-dark-ink" : "text-dark-ink-mute hover:text-dark-ink"}`}
    >
      {label}
    </button>
  );

  return (
    <div
      ref={ref}
      className="glass-dark flex h-full flex-col overflow-hidden rounded-2xl !bg-[rgba(12,12,12,0.88)] font-mono text-[12px] leading-relaxed"
      onMouseEnter={() => setPinned(true)}
      onFocus={() => setPinned(true)}
    >
      {/* title bar: the open file, and the Preview / Code switch an editor puts top right */}
      <div className="flex items-center gap-3 border-b border-[var(--dark-line)] py-2 pl-4 pr-2">
        <span className="hidden gap-1.5 sm:flex" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
        </span>
        <span className="min-w-0 flex-1 truncate text-dark-ink-dim">
          {view === "code" ? code.path : file.path}
          <span className="hidden text-dark-ink-mute md:inline"> · {view === "code" ? (code.lang === "swift" ? "Swift" : "TypeScript") : LANG_LABELS[file.lang]}</span>
        </span>
        <div role="tablist" aria-label="Show the site or its source" className="flex shrink-0 gap-0.5 rounded-lg bg-white/[0.06] p-0.5 text-[11px]">
          {tab("preview", "Preview")}
          {tab("code", "Code")}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* explorer */}
        <nav aria-label="Project files" className="hidden w-[216px] shrink-0 flex-col border-r border-[var(--dark-line)] py-3 sm:flex">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.16em] text-dark-ink-mute">Explorer</p>
          <ul>
            {entries.map((e, i) => (
              <li key={e.file.id}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-current={i === active}
                  className={`block w-full border-l-2 px-4 py-1.5 text-left transition-colors ${
                    i === active
                      ? "border-white bg-white/[0.07] text-dark-ink"
                      : "border-transparent text-dark-ink-dim hover:bg-white/[0.04] hover:text-dark-ink"
                  }`}
                >
                  <span className="block truncate">{e.file.file}</span>
                  <span className="block truncate text-[10.5px] text-dark-ink-mute">{e.host}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-auto px-4 pt-3 text-[11px] text-dark-ink-mute">
            4 of {IDE_PROJECTS.length} files
          </p>
        </nav>

        {/* editor */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div role="tabpanel" className="relative min-h-0 flex-1 overflow-hidden bg-black">
            {view === "code" ? (
              <CodePane code={code} />
            ) : (
              // keyed so each file mounts its own frame or player
              <ProjectMedia key={file.id} project={file.project} />
            )}
          </div>
          <Link
            to={`/workstation?file=${encodeURIComponent(file.file)}`}
            className="group flex items-start gap-3 border-t border-[var(--dark-line)] px-4 py-3"
            aria-label={`Open ${file.file} in the workstation`}
          >
            <div className="min-w-0 flex-1 font-sans">
              <p className="truncate text-[14px] font-medium text-dark-ink">
                {file.project.shortTitle ?? file.title}
                <span className="font-mono text-[11px] font-normal text-dark-ink-mute"> · {host}</span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-[1.45] text-dark-ink-dim">{file.tagline}</p>
            </div>
            <ArrowUpRight className="mt-0.5 shrink-0 text-dark-ink-mute transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* phone: the explorer collapses to steps */}
      <div className="flex items-center justify-center gap-1 border-t border-[var(--dark-line)] py-1.5 sm:hidden">
        {entries.map((e, i) => (
          <button
            key={e.file.id}
            type="button"
            onClick={() => pick(i)}
            aria-label={`Show ${e.host}`}
            aria-current={i === active}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span className={`h-2 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-2 bg-white/45"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
