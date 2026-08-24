import { useMemo, useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIde } from './context';
import type { TabKind } from './context';
import { DOC_FILES, PROJECT_FILES, getDocLines, getFileLang, projectFileName, LANG_LABELS } from './files';
import type { DocId, DocLine, Span, Tone } from './files';
import { getProjectById } from './registryData';
import { ChevronRightIcon, CloseIcon, EllipsisIcon, FileTypeIcon, GitHubIcon, SpinnerIcon, SplitIcon } from './icons';

/** The 3D custom editor: lazy so three.js loads only when a project file opens. */
const ModelViewer = lazy(() => import('./ModelViewer'));

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
    const meta = PROJECT_FILES[api.projectTab];
    parts.push({ label: 'projects' });
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

function DocEditor({ docId }: { docId: DocId }) {
  const api = useIde();
  const { tokens } = api;
  const [activeLine, setActiveLine] = useState(1);
  const lines = useMemo(
    () => getDocLines(docId, { listFiles: api.isMobile }),
    [docId, api.isMobile]
  );

  useEffect(() => {
    setActiveLine(1);
    api.setCursorLine(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

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

function ProjectDetails() {
  const api = useIde();
  const { tokens } = api;
  const project = api.projectTab ? getProjectById(api.projectTab) : undefined;
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
  const meta = PROJECT_FILES[project.id];

  const header = (
    <div
      className="flex h-[35px] shrink-0 items-center justify-between pl-3 pr-1.5"
      style={{ borderBottom: `1px solid ${tokens.border}` }}
    >
      <span className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-wide" style={{ color: tokens.chromeFgDim }}>
        Details
        <span className="normal-case tracking-normal" style={{ color: tokens.chromeFg }}>
          {meta?.file}
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
      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-[26px] items-center gap-1.5 rounded-sm px-3 text-[13px]"
          style={{ backgroundColor: tokens.buttonBg, color: tokens.buttonFg }}
        >
          <GitHubIcon size={13} />
          View on GitHub
        </a>
      )}

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

      {project.additionalProjects?.length ? (
        <>
          <p className="mb-1.5 mt-5 text-[11px] font-bold uppercase tracking-wide" style={{ color: tokens.chromeFgDim }}>
            Related projects
          </p>
          <div className="space-y-3">
            {project.additionalProjects.map((add, i) => (
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
        Drag the 3D model to rotate it. Esc closes the file.
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
            {meta && <FileTypeIcon lang={meta.lang} size={15} />}
            <span className="truncate">projects/{meta?.file}</span>
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

export function EditorArea() {
  const api = useIde();
  const { tokens } = api;
  const isProjectView = api.activeTab === 'project' && api.projectTab !== null;
  const empty = api.openDocs.length === 0 && !api.projectTab;

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
        {api.projectTab && (
          <div className="absolute inset-0" style={{ display: isProjectView ? 'block' : 'none' }}>
            {/* The canvas stops where the details panel starts, so the model
                centers itself in the space that is actually visible. */}
            <div
              className="absolute inset-y-0 left-0"
              style={{ right: api.isMobile ? 0 : 'min(384px, 48vw)' }}
            >
              <Suspense fallback={<ViewerLoading file={projectFileName(api.projectTab)} />}>
                <ModelViewer
                  key={api.projectTab}
                  id={api.projectTab}
                  accent={tokens.accent}
                  isDark={tokens.isDark}
                  reducedMotion={api.reducedMotion}
                  onReady={() => api.setViewerLoading(false)}
                />
              </Suspense>
              {api.viewerLoading && <ViewerLoading file={projectFileName(api.projectTab)} />}
            </div>
            <AnimatePresence>{isProjectView && <ProjectDetails key={api.projectTab} />}</AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export { LANG_LABELS, getFileLang };
