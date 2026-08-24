/**
 * Inline 16x16 outline icons drawn in the style of VS Code's codicons.
 * Stroke-based, currentColor, no icon library.
 */

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function Svg({ size = 16, className, children, strokeWidth = 1.1 }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* ---------- Activity bar ---------- */

export function FilesIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <path d="M5.5 3.5h5l2 2v7h-7v-9z" />
      <path d="M10.5 3.5v2h2" />
      <path d="M5.5 5.5h-2v8h6.5" />
    </Svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.3}>
      <circle cx="6.8" cy="6.8" r="3.9" />
      <path d="M9.7 9.7l3.4 3.4" />
    </Svg>
  );
}

export function SourceControlIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <circle cx="4.5" cy="3.8" r="1.6" />
      <circle cx="4.5" cy="12.2" r="1.6" />
      <circle cx="11.5" cy="5.8" r="1.6" />
      <path d="M4.5 5.4v5.2" />
      <path d="M11.5 7.4c0 2.4-2.4 3-4.6 3.4" />
    </Svg>
  );
}

export function DebugIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <path d="M5 3.2l8 4.8-8 4.8v-9.6z" />
    </Svg>
  );
}

export function ExtensionsIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <rect x="2.8" y="7.2" width="5.2" height="5.2" />
      <rect x="8.6" y="7.8" width="4.6" height="4.6" transform="rotate(-45 10.9 10.1)" />
      <rect x="2.8" y="2.8" width="5.2" height="3.2" />
      <rect x="9" y="2.8" width="4.2" height="3.2" />
    </Svg>
  );
}

export function AccountIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="6.4" r="2" />
      <path d="M4.2 12.2c.8-1.7 2.2-2.6 3.8-2.6s3 .9 3.8 2.6" />
    </Svg>
  );
}

export function GearIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M12.4 3.6L11 5M5 11l-1.4 1.4" />
    </Svg>
  );
}

/* ---------- Chrome ---------- */

export function ChevronRightIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.4}>
      <path d="M6 3.8L10.2 8 6 12.2" />
    </Svg>
  );
}

export function ChevronDownIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.4}>
      <path d="M3.8 6L8 10.2 12.2 6" />
    </Svg>
  );
}

export function ChevronUpIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.4}>
      <path d="M3.8 10L8 5.8 12.2 10" />
    </Svg>
  );
}

export function CloseIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Svg>
  );
}

export function EllipsisIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1}>
      <circle cx="3.6" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12.4" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function SplitIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <rect x="2.5" y="3" width="11" height="10" />
      <path d="M8 3v10" />
    </Svg>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.3}>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </Svg>
  );
}

export function TrashIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5h5.6l.7-8.5" />
      <path d="M6.7 7v4M9.3 7v4" />
    </Svg>
  );
}

export function NewFileIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <path d="M4 2.5h5l2.5 2.5v4" />
      <path d="M9 2.5V5h2.5" />
      <path d="M4 2.5v11h4" />
      <path d="M11.5 10.5v4M9.5 12.5h4" />
    </Svg>
  );
}

export function RefreshIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <path d="M13 8a5 5 0 1 1-1.6-3.7" />
      <path d="M13 2.8v3h-3" />
    </Svg>
  );
}

export function CollapseAllIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <rect x="4.5" y="4.5" width="9" height="9" />
      <path d="M4.5 7h-2v-4.5H7v2M7 9h4" />
    </Svg>
  );
}

export function LayoutSidebarIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M6 3v10" />
    </Svg>
  );
}

export function LayoutPanelIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M2 9.5h12" />
    </Svg>
  );
}

export function TerminalIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <path d="M3.5 4.5L7 8l-3.5 3.5" />
      <path d="M8.5 11.5h4" />
    </Svg>
  );
}

export function BellIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <path d="M8 2.6c-2.2 0-3.6 1.6-3.6 3.8 0 2.7-.9 3.7-1.4 4.2h10c-.5-.5-1.4-1.5-1.4-4.2 0-2.2-1.4-3.8-3.6-3.8z" />
      <path d="M6.8 12.6a1.3 1.3 0 0 0 2.4 0" />
    </Svg>
  );
}

export function SyncIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <path d="M12.8 6.5A5 5 0 0 0 4 5.2M3.2 9.5A5 5 0 0 0 12 10.8" />
      <path d="M12.8 3.5v3h-3M3.2 12.5v-3h3" />
    </Svg>
  );
}

export function BranchIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.2}>
      <circle cx="4.8" cy="4" r="1.5" />
      <circle cx="4.8" cy="12" r="1.5" />
      <circle cx="11.2" cy="6" r="1.5" />
      <path d="M4.8 5.5v5" />
      <path d="M11.2 7.5c0 2-2.2 2.6-4.2 3" />
    </Svg>
  );
}

export function ErrorIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" />
    </Svg>
  );
}

export function WarningIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <path d="M8 2.8L14 13H2L8 2.8z" />
      <path d="M8 6.5v3M8 11.2v.3" />
    </Svg>
  );
}

export function RemoteIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.4}>
      <path d="M5.5 4L2 8l3.5 4" />
      <path d="M10.5 4L14 8l-3.5 4" />
    </Svg>
  );
}

export function FolderIcon({ open, ...p }: IconProps & { open?: boolean }) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      {open ? (
        <>
          <path d="M2.5 4.5v8h9.5l1.8-5H4.6l-1 2.6" />
          <path d="M2.5 4.5h4l1 1.5h5v1.5" />
        </>
      ) : (
        <path d="M2.5 12.5v-8h4l1 1.5h6v6.5h-11z" />
      )}
    </Svg>
  );
}

export function LinkExternalIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.1}>
      <path d="M9 3h4v4M13 3L7.5 8.5" />
      <path d="M11 9.5V13H3V5h3.5" />
    </Svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.4}>
      <path d="M3 8.5l3.2 3.2L13 4.5" />
    </Svg>
  );
}

export function CircleFilledIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="8" r="3.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function SpinnerIcon(p: IconProps) {
  return (
    <Svg {...p} strokeWidth={1.5} className={`ide-spin ${p.className ?? ''}`}>
      <path d="M8 2.5a5.5 5.5 0 1 1-5.5 5.5" />
    </Svg>
  );
}

export function GitHubIcon(p: IconProps) {
  return (
    <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 16 16" fill="currentColor" className={p.className} aria-hidden>
      <path d="M8 .8a7.2 7.2 0 0 0-2.28 14.03c.36.07.5-.15.5-.35v-1.22c-2 .43-2.43-.97-2.43-.97-.32-.83-.8-1.05-.8-1.05-.65-.45.05-.44.05-.44.73.05 1.11.75 1.11.75.64 1.1 1.68.78 2.1.6.06-.47.25-.79.45-.97-1.6-.18-3.28-.8-3.28-3.56 0-.79.28-1.43.74-1.94-.07-.18-.32-.91.07-1.9 0 0 .6-.2 1.98.74a6.9 6.9 0 0 1 3.6 0c1.37-.93 1.97-.74 1.97-.74.4.99.15 1.72.07 1.9.46.5.74 1.15.74 1.94 0 2.77-1.69 3.38-3.3 3.56.26.22.49.66.49 1.33v1.97c0 .2.13.42.5.35A7.2 7.2 0 0 0 8 .8z" />
    </svg>
  );
}

/* ---------- File-type icons (Seti-style colored glyphs) ---------- */

const FILE_GLYPH_FONT = "ui-monospace, Menlo, Monaco, 'IBM Plex Mono', monospace";

function GlyphIcon({ size = 16, color, label, fontSize = 7.5 }: { size?: number; color: string; label: string; fontSize?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <text
        x="8"
        y="8.6"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontFamily={FILE_GLYPH_FONT}
        fontWeight={700}
        fontSize={fontSize}
      >
        {label}
      </text>
    </svg>
  );
}

export const FILE_TYPE_COLORS: Record<string, string> = {
  py: '#4B8BBE',
  cpp: '#F34B7D',
  cs: '#3FB950',
  c: '#A8B9CC',
  sql: '#E38C00',
  md: '#519ABA',
  json: '#CBCB41',
  pdf: '#E05252',
};

export function FileTypeIcon({ lang, size = 16 }: { lang: string; size?: number }) {
  const color = FILE_TYPE_COLORS[lang] ?? '#8B949E';
  switch (lang) {
    case 'md':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
          <path d="M2.5 11.5v-7l2.6 3 2.6-3v7" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 5v5M10 8.4l2 2.2 2-2.2" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'json':
      return <GlyphIcon size={size} color={color} label="{}" fontSize={9} />;
    case 'py':
      return <GlyphIcon size={size} color={color} label="py" fontSize={8} />;
    case 'cpp':
      return <GlyphIcon size={size} color={color} label="C++" fontSize={6.4} />;
    case 'cs':
      return <GlyphIcon size={size} color={color} label="C#" fontSize={7.5} />;
    case 'c':
      return <GlyphIcon size={size} color={color} label="C" fontSize={9} />;
    case 'sql':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
          <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
            <ellipse cx="8" cy="4.2" rx="4.5" ry="1.8" />
            <path d="M3.5 4.2v7.6c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8V4.2" />
            <path d="M3.5 8c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8" />
          </g>
        </svg>
      );
    case 'pdf':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
          <path d="M4 1.8h5.2L12 4.6v9.6H4V1.8z" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9.2 1.8v2.8H12" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
          <text x="8" y="10.6" textAnchor="middle" fill={color} fontFamily={FILE_GLYPH_FONT} fontWeight={700} fontSize="4.2">
            PDF
          </text>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
          <path d="M4 1.8h5.2L12 4.6v9.6H4V1.8z" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9.2 1.8v2.8H12" fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
  }
}
