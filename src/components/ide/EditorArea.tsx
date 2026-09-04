import { useCallback, useMemo, useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIde } from './context';
import type { TabKind } from './context';
import { DOC_FILES, PROJECT_FILES, buildProjectLines, getDocLines, getFileLang, projectFileName, LANG_LABELS } from './files';
import type { DocId, DocLine, Span, Tone } from './files';
import { getIdeProject } from './projectRegistry';
import type { IdeProject } from './projectRegistry';
import { modelUrlFor } from './projectModels';
import { ChevronRightIcon, CloseIcon, EllipsisIcon, FileTypeIcon, GitHubIcon, SpinnerIcon, SplitIcon } from './icons';

/** The 3D custom editor: lazy so three.js loads only when a project file opens. */
const ModelViewer = lazy(() => import('./ModelViewer'));
/** Canvas globe, lazy for the same reason. */
const TileGlobe = lazy(() => import('../work/ui/TileGlobe'));

type IdePreview =
  | { kind: 'model'; src: string }
  | { kind: 'video'; src: string; poster?: string; alt: string }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'embed'; url: string }
  | { kind: 'globe' };

/**
 * How a project file renders in the editor. A project with a model, clip,
 * screenshot, or embeddable site opens as that medium with a details panel
 * beside it; one with none opens as a document instead (see buildProjectLines),
 * which reads better than a placeholder and repeats nothing.
 */
function previewFor(p: IdeProject): IdePreview | null {
  const model = modelUrlFor(p.id);
  if (model) return { kind: 'model', src: model };
  const m = p.project.tileMedia;
  if (!m) return null;
  if (m.kind === 'video') return { kind: 'video', src: m.src, poster: m.poster, alt: m.alt };
  if (m.kind === 'image') return { kind: 'image', src: m.src, alt: m.alt };
  if (m.kind === 'globe') return { kind: 'globe' };
  if (m.kind === 'site' && m.embed) return { kind: 'embed', url: m.url };
  // A site that blocks framing has nothing to render here.
  return null;
}

/** What the details panel tells you to do, per medium. */
const PREVIEW_HINT: Record<IdePreview['kind'], string> = {
  model: 'Drag the 3D model to rotate it. Esc closes the file.',
  video: 'The clip is real capture from the project. Esc closes the file.',
  image: 'Esc closes the file.',
  embed: 'This is the live site, running in the editor. Esc closes the file.',
  globe: 'Esc closes the file.',
};

/* ------------------------------------------------------------------ */
/* Tab strip                                                           */
/* ------------------------------------------------------------------ */

function EditorTab({
  label,
  lang,
  active,
  loading,
  onSelect,
  onClose,
}: {
  label: string;
  lang: string;
  active: boolean;
  loading?: boolean;
  onSelect: () => void;
  onClose: () => void;
}) {
  const { tokens } = useIde();
  const [hover, setHover] = useState(false);
  return (
    <div
      className="group relative flex h-[35px] shrink-0 items-stretch"
      style={{
        backgroundColor: active ? tokens.tabActiveBg : tokens.tabInactiveBg,
        borderRight: `1px solid ${tokens.border}`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {active && <span className="absolute inset-x-0 top-0 h-px" style={{ backgroundColor: tokens.tabActiveBorderTop }} />}
      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-1.5 pl-2.5 pr-1 text-[13px]"
        style={{ color: active ? tokens.tabActiveFg : tokens.tabInactiveFg }}
      >
        {loading ? (
          <span style={{ color: tokens.accent }}>
            <SpinnerIcon size={14} />
          </span>
        ) : (
          <FileTypeIcon lang={lang} size={15} />
        )}
        <span className="whitespace-nowrap">{label}</span>
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${label}`}
        className="my-auto mr-1 rounded p-0.5"
        style={{
          color: active ? tokens.tabActiveFg : tokens.tabInactiveFg,
          visibility: hover || active ? 'visible' : 'hidden',
        }}
      >
        <CloseIcon size={13} />
      </button>
    </div>
  );
}

function TabStrip() {
  const api = useIde();
  const { tokens } = api;
  return (
    <div
      className="flex h-[35px] shrink-0 items-stretch"
      style={{ backgroundColor: tokens.chromeBg, borderBottom: `1px solid ${tokens.border}` }}
    >
      <div className="no-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto">
        {api.openDocs.map((id) => {
          const doc = DOC_FILES.find((d) => d.id === id)!;
          return (
            <EditorTab
              key={id}
              label={doc.file}
              lang={doc.lang}
              active={api.activeTab === id}
              onSelect={() => api.setActiveTab(id)}
              onClose={() => api.closeDocTab(id)}
            />
          );
        })}
        {api.projectTab && (
          <EditorTab
            label={projectFileName(api.projectTab)}
            lang={PROJECT_FILES[api.projectTab]?.lang ?? 'md'}
            active={api.activeTab === 'project'}
            loading={api.viewerLoading}
            onSelect={() => api.setActiveTab('project')}
            onClose={api.closeProjectTab}
          />
        )}
      </div>
      <div className="ml-auto flex items-center gap-0.5 px-2" style={{ color: tokens.chromeFgDim }}>
        <span className="hidden p-1 sm:block" title="Split Editor">
          <SplitIcon size={14} />
        </span>
        <span className="p-1" title="More Actions">
          <EllipsisIcon size={14} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Breadcrumbs                                                         */
/* ------------------------------------------------------------------ */

function Breadcrumbs({ activeTab }: { activeTab: TabKind }) {
  const api = useIde();
  const { tokens } = api;
  const parts: { label: string; lang?: string }[] = [{ label: 'Edusei-Workstation' }];
  if (activeTab === 'project' && api.projectTab) {
    const meta = getIdeProject(api.projectTab);
    parts.push({ label: 'projects' });
    if (meta) parts.push({ label: meta.folder });
    parts.push({ label: meta?.file ?? 'file', lang: meta?.lang });
  } else {
    const doc = DOC_FILES.find((d) => d.id === activeTab);
    if (doc) parts.push({ label: doc.file, lang: doc.lang });
  }
  return (
    <div
      className="flex h-[22px] shrink-0 items-center gap-0.5 px-3 text-[12px]"
      style={{ backgroundColor: tokens.editorBg, color: tokens.chromeFgDim }}
    >
      {parts.map((p, i) => (
        <span key={i} className="flex min-w-0 items-center gap-0.5">
          {i > 0 && <ChevronRightIcon size={11} />}
          {p.lang && <FileTypeIcon lang={p.lang} size={13} />}
          <span className="truncate">{p.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Document editor                                                     */
/* ------------------------------------------------------------------ */

function toneColor(tone: Tone | undefined, t: ReturnType<typeof useIde>['tokens']): string {
  switch (tone) {
    case 'heading':
      return t.syntax.heading;
    case 'bold':
      return t.editorFg;
    case 'string':
      return t.syntax.string;
    case 'comment':
      return t.syntax.comment;
    case 'keyword':
      return t.syntax.keyword;
    case 'variable':
      return t.syntax.variable;
    case 'punct':
      return t.syntax.punct;
    case 'link':
      return t.link;
    case 'dim':
      return t.editorFgDim;
    default:
      return t.editorFg;
  }
}

function SpanView({ span }: { span: Span }) {
  const api = useIde();
  const { tokens } = api;
  const color = toneColor(span.tone, tokens);
  const weight = span.tone === 'heading' || span.tone === 'bold' ? 600 : 400;
  const fontStyle = span.tone === 'comment' ? 'italic' : 'normal';
  if (span.href) {
    return (
      <a
        href={span.href}
        target={span.href.startsWith('http') ? '_blank' : undefined}
        rel="noopener noreferrer"
        className="hover:underline"
        style={{ color, fontWeight: weight }}
      >
        {span.t}
      </a>
    );
  }
  if (span.openFile) {
    return (
      <button type="button" className="hover:underline" style={{ color, fontWeight: weight }} onClick={() => api.openFileByName(span.openFile!)}>
        {span.t}
      </button>
    );
  }
  return <span style={{ color, fontWeight: weight, fontStyle }}>{span.t}</span>;
}

function Minimap({ lines }: { lines: DocLine[] }) {
  const { tokens } = useIde();
  return (
    <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-[68px] pt-2 lg:block" aria-hidden>
      <div
        className="absolute inset-y-0 left-0 w-px"
        style={{ backgroundColor: tokens.border, opacity: 0.6 }}
      />
      <div className="flex flex-col gap-[2px] px-2">
        {lines.slice(0, 160).map((line, i) => {
          const text = line.map((s) => s.t).join('');
          if (!text.trim()) return <div key={i} className="h-[2px]" />;
          const first = line.find((s) => s.t.trim());
          return (
            <div
              key={i}
              className="h-[2px] rounded-full"
              style={{
                width: Math.min(52, Math.max(6, text.length * 0.6)),
                backgroundColor: toneColor(first?.tone, tokens),
                opacity: 0.38,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** The line-numbered, syntax-toned reader shared by docs and project files. */
function CodeView({ lines, resetKey }: { lines: DocLine[]; resetKey: string }) {
  const api = useIde();
  const { tokens } = api;
  const [activeLine, setActiveLine] = useState(1);

  useEffect(() => {
    setActiveLine(1);
    api.setCursorLine(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <div className="relative h-full min-h-0">
      <div
        className="terminal-scroll h-full overflow-y-auto py-2 pr-2 lg:pr-[76px]"
        style={{
          '--scrollbar-color': `${tokens.scrollbar}55`,
          '--scrollbar-color-hover': `${tokens.scrollbar}88`,
        } as React.CSSProperties}
      >
        <div className="ide-code min-w-0 cursor-text select-text">
          {lines.map((line, i) => {
            const n = i + 1;
            const isActive = n === activeLine;
            return (
              <div
                key={i}
                className="flex items-start"
                style={{ backgroundColor: isActive ? tokens.lineHighlight : 'transparent' }}
                onClick={() => {
                  setActiveLine(n);
                  api.setCursorLine(n);
                }}
              >
                <span
                  className="w-12 shrink-0 select-none pr-4 text-right"
                  style={{ color: isActive ? tokens.lineNumberActive : tokens.lineNumber }}
                  aria-hidden
                >
                  {n}
                </span>
                <span className="min-w-0 flex-1 whitespace-pre-wrap break-words pr-3">
                  {line.length === 0 ? ' ' : line.map((s, j) => <SpanView key={j} span={s} />)}
                </span>
              </div>
            );
          })}
          <div className="h-24" />
        </div>
      </div>
      <Minimap lines={lines} />
    </div>
  );
}

function DocEditor({ docId }: { docId: DocId }) {
  const api = useIde();
  const lines = useMemo(() => getDocLines(docId, { listFiles: api.isMobile }), [docId, api.isMobile]);
  return <CodeView lines={lines} resetKey={docId} />;
}

/** A project with no visual medium, read as the contents of its own file. */
function ProjectDocView({ project }: { project: IdeProject }) {
  const lines = useMemo(() => buildProjectLines(project), [project]);
  return <CodeView lines={lines} resetKey={project.id} />;
}

/* ------------------------------------------------------------------ */
/* Empty editor watermark                                              */
/* ------------------------------------------------------------------ */

function Watermark() {
  const { tokens, isMac } = useIde();
  const rows: [string, string][] = [
    ['Show All Commands', isMac ? '⇧⌘P' : 'Ctrl+Shift+P'],
    ['Go to File', isMac ? '⌘P' : 'Ctrl+P'],
    ['Toggle Terminal', '⌃`'],
    ['Toggle Side Bar', isMac ? '⌘B' : 'Ctrl+B'],
  ];
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-2.5">
        {rows.map(([label, keys]) => (
          <div key={label} className="flex items-center justify-end gap-3 text-[13px]" style={{ color: tokens.editorFgDim }}>
            <span>{label}</span>
            <kbd
              className="rounded px-1.5 py-0.5 text-[11px]"
              style={{ backgroundColor: tokens.inputBg, border: `1px solid ${tokens.inputBorder}`, color: tokens.editorFgDim }}
            >
              {keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project custom editor (3D model as file contents + details panel)   */
/* ------------------------------------------------------------------ */

function ProjectDetails({ hint }: { hint: string }) {
  const api = useIde();
  const { tokens } = api;
  const project = api.projectTab ? getIdeProject(api.projectTab) : undefined;
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [sheetOpen, setSheetOpen] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setExpanded({});
    setSheetOpen(true);
  }, [api.projectTab]);

  useEffect(() => {
    if (api.activeTab === 'project') closeRef.current?.focus();
  }, [api.activeTab, api.projectTab]);

  if (!project) return null;

  const header = (
    <div
      className="flex h-[35px] shrink-0 items-center justify-between pl-3 pr-1.5"
      style={{ borderBottom: `1px solid ${tokens.border}` }}
    >
      <span className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-wide" style={{ color: tokens.chromeFgDim }}>
        Details
        <span className="normal-case tracking-normal" style={{ color: tokens.chromeFg }}>
          {project.file}
        </span>
      </span>
      <button
        ref={closeRef}
        type="button"
        onClick={api.closeProjectTab}
        aria-label="Close file and return"
        className="rounded p-1"
        style={{ color: tokens.chromeFgDim }}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );

  const body = (
    <div
      className="terminal-scroll min-h-0 flex-1 overflow-y-auto px-4 py-3"
      style={{ '--scrollbar-color': `${tokens.scrollbar}55`, '--scrollbar-color-hover': `${tokens.scrollbar}88` } as React.CSSProperties}
    >
      <h1 className="text-[16px] font-semibold leading-snug" style={{ color: tokens.chromeFg }}>
        {project.title}
      </h1>
      <p className="mt-0.5 text-[12px]" style={{ color: tokens.chromeFgDim }}>
        {project.period} · {project.location}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[26px] items-center gap-1.5 rounded-sm px-3 text-[13px]"
            style={{ backgroundColor: tokens.buttonBg, color: tokens.buttonFg }}
          >
            <GitHubIcon size={13} />
            View on GitHub
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[26px] items-center rounded-sm px-3 text-[13px]"
            style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.chromeFg }}
          >
            View live
          </a>
        )}
        <a
          href={`/work/${project.id}`}
          className="inline-flex h-[26px] items-center rounded-sm px-3 text-[13px]"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.chromeFg }}
        >
          Full entry
        </a>
      </div>

      <div className="mt-4 space-y-2.5">
        {project.description.map((para, i) => (
          <p key={i} className="text-[13px] leading-relaxed" style={{ color: tokens.editorFgDim }}>
            {para}
          </p>
        ))}
      </div>

      <p className="mb-1.5 mt-5 text-[11px] font-bold uppercase tracking-wide" style={{ color: tokens.chromeFgDim }}>
        Technologies
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-sm px-1.5 py-0.5 text-[11px]"
            style={{ backgroundColor: tokens.inputBg, border: `1px solid ${tokens.inputBorder}`, color: tokens.chromeFgDim }}
          >
            {tech}
          </span>
        ))}
      </div>

      {project.project.additionalProjects?.length ? (
        <>
          <p className="mb-1.5 mt-5 text-[11px] font-bold uppercase tracking-wide" style={{ color: tokens.chromeFgDim }}>
            Related projects
          </p>
          <div className="space-y-3">
            {project.project.additionalProjects.map((add, i) => (
              <div key={i} className="pl-2.5" style={{ borderLeft: `2px solid ${tokens.border}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium" style={{ color: tokens.chromeFg }}>
                    {add.title}
                  </span>
                  {add.github && (
                    <a
                      href={add.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] underline"
                      style={{ color: tokens.link }}
                    >
                      GitHub
                    </a>
                  )}
                </div>
                <p className="text-[11px]" style={{ color: tokens.chromeFgDim }}>
                  {add.period}
                </p>
                {expanded[i] && (
                  <div className="mt-1 space-y-1.5">
                    {add.description.map((para, j) => (
                      <p key={j} className="text-[12px] leading-relaxed" style={{ color: tokens.editorFgDim }}>
                        {para}
                      </p>
                    ))}
                  </div>
                )}
                {add.description.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                    className="mt-0.5 text-[11px] underline"
                    style={{ color: tokens.chromeFgDim }}
                  >
                    {expanded[i] ? 'Show less' : 'Details'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : null}

      <p className="mt-5 border-t pt-3 text-[11px]" style={{ borderColor: tokens.border, color: tokens.chromeFgDim }}>
        {hint}
      </p>
    </div>
  );

  if (api.isMobile) {
    return (
      <motion.div
        initial={false}
        animate={{ y: sheetOpen ? 0 : 'calc(100% - 36px)' }}
        exit={api.reducedMotion ? undefined : { y: '100%' }}
        transition={{ duration: api.reducedMotion ? 0 : 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex flex-col"
        style={{ maxHeight: '58vh', backgroundColor: tokens.chromeBg, borderTop: `1px solid ${tokens.border}` }}
      >
        <button
          type="button"
          className="flex h-9 shrink-0 items-center justify-between px-3 text-left"
          onClick={() => setSheetOpen((v) => !v)}
          aria-expanded={sheetOpen}
          style={{ borderBottom: `1px solid ${tokens.border}` }}
        >
          <span className="flex min-w-0 items-center gap-1.5 text-[13px]" style={{ color: tokens.chromeFg }}>
            <FileTypeIcon lang={project.lang} size={15} />
            <span className="truncate">{project.path}</span>
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              api.closeProjectTab();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                api.closeProjectTab();
              }
            }}
            aria-label="Close file"
            className="p-1"
            style={{ color: tokens.chromeFgDim }}
          >
            <CloseIcon size={14} />
          </span>
        </button>
        {body}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={api.reducedMotion ? false : { x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={api.reducedMotion ? undefined : { x: 32, opacity: 0 }}
      transition={{ duration: api.reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto absolute bottom-3 right-3 top-3 flex w-[360px] max-w-[46vw] flex-col overflow-hidden rounded-md"
      style={{
        backgroundColor: tokens.chromeBg,
        border: `1px solid ${tokens.border}`,
        boxShadow: `0 8px 24px ${tokens.widgetShadow}`,
      }}
    >
      {header}
      {body}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor area shell                                                   */
/* ------------------------------------------------------------------ */

function ViewerLoading({ file }: { file: string }) {
  const { tokens } = useIde();
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-2 text-[13px]" style={{ color: tokens.editorFgDim }}>
        <span style={{ color: tokens.accent }}>
          <SpinnerIcon size={15} />
        </span>
        Loading {file}...
      </div>
    </div>
  );
}

/**
 * The file's contents: a model, a clip, a screenshot, or the live site. Each
 * medium reports readiness its own way so the tab spinner always stops.
 */
function ProjectPreview({ media, project }: { media: IdePreview; project: IdeProject }) {
  const api = useIde();
  const { tokens } = api;
  const { setViewerLoading } = api;
  const ready = useCallback(() => setViewerLoading(false), [setViewerLoading]);

  useEffect(() => {
    // The globe paints immediately and fires no load event of its own.
    if (media.kind === 'globe') ready();
  }, [media.kind, ready]);

  switch (media.kind) {
    case 'model':
      return (
        <Suspense fallback={<ViewerLoading file={project.file} />}>
          <ModelViewer
            id={project.id}
            accent={tokens.accent}
            isDark={tokens.isDark}
            reducedMotion={api.reducedMotion}
            onReady={ready}
          />
        </Suspense>
      );
    case 'video':
      return (
        <video
          className="h-full w-full object-contain"
          src={media.src}
          poster={media.poster}
          aria-label={media.alt}
          autoPlay={!api.reducedMotion}
          loop
          muted
          playsInline
          controls={api.reducedMotion}
          onCanPlay={ready}
          onError={ready}
        />
      );
    case 'image':
      return (
        <img src={media.src} alt={media.alt} className="h-full w-full object-contain" onLoad={ready} onError={ready} />
      );
    case 'embed':
      return <SiteEmbed url={media.url} title={project.title} onReady={ready} />;
    case 'globe':
      return (
        <Suspense fallback={null}>
          <TileGlobe />
        </Suspense>
      );
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * A live site rendered in the editor, inside browser chrome.
 *
 * Some of these sites restrict framing with `frame-ancestors`, so the frame
 * paints nothing on origins they do not list (a local preview port, say).
 * There is no way to detect that from out here — a blocked frame and a
 * still-loading one look identical — so the pane is built to work either way:
 * the chrome bar sits outside the frame and always opens the real site, and a
 * note behind the frame shows through when nothing paints over it.
 */
function SiteEmbed({ url, title, onReady }: { url: string; title: string; onReady: () => void }) {
  const { tokens } = useIde();
  const host = hostOf(url);

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="flex h-[28px] shrink-0 items-center gap-2 px-3"
        style={{ backgroundColor: tokens.chromeBg, borderBottom: `1px solid ${tokens.border}` }}
      >
        <span className="flex gap-1.5" aria-hidden>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <span key={c} className="h-[9px] w-[9px] rounded-full" style={{ backgroundColor: c }} />
          ))}
        </span>
        <span className="truncate text-[11px]" style={{ color: tokens.chromeFgDim }}>
          {host}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 text-[11px] hover:underline"
          style={{ color: tokens.link }}
        >
          Open ↗
        </a>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <span className="text-[12px]" style={{ color: tokens.editorFgDim }}>
            {host} does not allow embedding from this address — use Open ↗.
          </span>
        </div>
        <iframe
          src={url}
          title={`${title} (live site)`}
          className="absolute inset-0 h-full w-full"
          style={{ border: 0 }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
          onLoad={onReady}
        />
      </div>
    </div>
  );
}

export function EditorArea() {
  const api = useIde();
  const { tokens } = api;
  const isProjectView = api.activeTab === 'project' && api.projectTab !== null;
  const empty = api.openDocs.length === 0 && !api.projectTab;
  const project = api.projectTab ? getIdeProject(api.projectTab) : undefined;
  const preview = project ? previewFor(project) : null;
  const { setViewerLoading } = api;

  // A document-view project has no medium to fire a load event, so the tab
  // spinner has to be cleared here or it would spin for good.
  useEffect(() => {
    if (project && !preview) setViewerLoading(false);
  }, [project, preview, setViewerLoading]);

  return (
    <div className="pointer-events-auto flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="relative">
        <TabStrip />
        {api.busy && (
          <div className="ide-progress-track" aria-hidden>
            <div className="ide-progress-bit" style={{ backgroundColor: tokens.accent }} />
          </div>
        )}
      </div>
      {!empty && <Breadcrumbs activeTab={api.activeTab} />}

      <div className="relative min-h-0 flex-1" style={{ backgroundColor: tokens.editorBg }}>
        {empty && <Watermark />}
        {!empty && !isProjectView && api.activeTab !== 'project' && <DocEditor docId={api.activeTab as DocId} />}

        {/* Keep the viewer mounted while its tab is inactive so the model does
            not reload every time the visitor flips between tabs. */}
        {/* Keep the preview mounted while its tab is inactive so the model does
            not reload every time the visitor flips between tabs. */}
        {project && preview && (
          <div className="absolute inset-0" style={{ display: isProjectView ? 'block' : 'none' }}>
            {/* The medium stops where the details panel starts, so it centers
                itself in the space that is actually visible. */}
            <div
              className="absolute inset-y-0 left-0"
              style={{ right: api.isMobile ? 0 : 'min(384px, 48vw)' }}
            >
              <ProjectPreview key={project.id} media={preview} project={project} />
              {api.viewerLoading && <ViewerLoading file={project.file} />}
            </div>
            <AnimatePresence>
              {isProjectView && <ProjectDetails key={project.id} hint={PREVIEW_HINT[preview.kind]} />}
            </AnimatePresence>
          </div>
        )}

        {/* No model, clip, screenshot, or embeddable site: the project opens as
            its own document, full width, with no details panel to duplicate. */}
        {project && !preview && isProjectView && <ProjectDocView project={project} />}
      </div>
    </div>
  );
}

export { LANG_LABELS, getFileLang };
