import type { ThemePreset } from '../../store/themeStore';

/**
 * VS Code-style color tokens for the IDE shell.
 *
 * The two base palettes are Dark Modern and Light Modern (the current VS Code
 * defaults). The site's own theme presets (CRT, Sky, Bulldog Red, ...) are
 * adapted on top of the matching base so the chrome always reads as a real
 * editor while keeping each preset's background, text, and accent identity.
 */
export interface IdeTokens {
  isDark: boolean;

  /** Window chrome: title bar, activity bar, side bar, panel, status bar. */
  chromeBg: string;
  chromeFg: string;
  chromeFgDim: string;
  border: string;

  /** Editor group. */
  editorBg: string;
  editorFg: string;
  editorFgDim: string;
  lineNumber: string;
  lineNumberActive: string;
  lineHighlight: string;
  indentGuide: string;

  /** Tabs. */
  tabActiveBg: string;
  tabInactiveBg: string;
  tabActiveFg: string;
  tabInactiveFg: string;
  tabActiveBorderTop: string;

  /** Lists (explorer tree, quick input results, menus). */
  listHoverBg: string;
  listActiveBg: string;
  listActiveFg: string;

  /** Inputs, buttons, badges, menus, widgets. */
  inputBg: string;
  inputBorder: string;
  focusBorder: string;
  buttonBg: string;
  buttonFg: string;
  buttonHoverBg: string;
  badgeBg: string;
  badgeFg: string;
  menuBg: string;
  menuBorder: string;
  widgetBg: string;
  widgetShadow: string;

  /** Status bar accents. */
  statusRemoteBg: string;
  statusRemoteFg: string;

  /** Accent used for progress bars, active borders, links. */
  accent: string;
  link: string;

  /** Terminal. */
  terminalFg: string;
  terminalFgDim: string;
  terminalPrompt: string;

  scrollbar: string;

  /** Syntax palette (Dark+ / Light+). */
  syntax: {
    keyword: string;
    control: string;
    string: string;
    comment: string;
    func: string;
    type: string;
    number: string;
    variable: string;
    heading: string;
    punct: string;
  };
}

const DARK_SYNTAX: IdeTokens['syntax'] = {
  keyword: '#569CD6',
  control: '#C586C0',
  string: '#CE9178',
  comment: '#6A9955',
  func: '#DCDCAA',
  type: '#4EC9B0',
  number: '#B5CEA8',
  variable: '#9CDCFE',
  heading: '#569CD6',
  punct: '#CCCCCC',
};

const LIGHT_SYNTAX: IdeTokens['syntax'] = {
  keyword: '#0000FF',
  control: '#AF00DB',
  string: '#A31515',
  comment: '#008000',
  func: '#795E26',
  type: '#267F99',
  number: '#098658',
  variable: '#001080',
  heading: '#0451A5',
  punct: '#3B3B3B',
};

/** VS Code Dark Modern. */
const DARK_MODERN: IdeTokens = {
  isDark: true,
  chromeBg: '#181818',
  chromeFg: '#CCCCCC',
  chromeFgDim: '#9D9D9D',
  border: '#2B2B2B',
  editorBg: '#1F1F1F',
  editorFg: '#CCCCCC',
  editorFgDim: '#9D9D9D',
  lineNumber: '#6E7681',
  lineNumberActive: '#CCCCCC',
  lineHighlight: 'rgba(255,255,255,0.04)',
  indentGuide: '#404040',
  tabActiveBg: '#1F1F1F',
  tabInactiveBg: '#181818',
  tabActiveFg: '#FFFFFF',
  tabInactiveFg: '#9D9D9D',
  tabActiveBorderTop: '#0078D4',
  listHoverBg: '#2A2D2E',
  listActiveBg: '#04395E',
  listActiveFg: '#FFFFFF',
  inputBg: '#313131',
  inputBorder: '#3C3C3C',
  focusBorder: '#0078D4',
  buttonBg: '#0078D4',
  buttonFg: '#FFFFFF',
  buttonHoverBg: '#026EC1',
  badgeBg: '#0078D4',
  badgeFg: '#FFFFFF',
  menuBg: '#1F1F1F',
  menuBorder: '#454545',
  widgetBg: '#222222',
  widgetShadow: 'rgba(0,0,0,0.36)',
  statusRemoteBg: '#0078D4',
  statusRemoteFg: '#FFFFFF',
  accent: '#0078D4',
  link: '#4DAAFC',
  terminalFg: '#CCCCCC',
  terminalFgDim: '#9D9D9D',
  terminalPrompt: '#16C60C',
  scrollbar: '#797979',
  syntax: DARK_SYNTAX,
};

/** VS Code Light Modern. */
const LIGHT_MODERN: IdeTokens = {
  isDark: false,
  chromeBg: '#F8F8F8',
  chromeFg: '#3B3B3B',
  chromeFgDim: '#616161',
  border: '#E5E5E5',
  editorBg: '#FFFFFF',
  editorFg: '#3B3B3B',
  editorFgDim: '#616161',
  lineNumber: '#6E7681',
  lineNumberActive: '#171184',
  lineHighlight: 'rgba(0,0,0,0.035)',
  indentGuide: '#D3D3D3',
  tabActiveBg: '#FFFFFF',
  tabInactiveBg: '#F8F8F8',
  tabActiveFg: '#3B3B3B',
  tabInactiveFg: '#868686',
  tabActiveBorderTop: '#005FB8',
  listHoverBg: '#F2F2F2',
  listActiveBg: '#E8E8E8',
  listActiveFg: '#000000',
  inputBg: '#FFFFFF',
  inputBorder: '#CECECE',
  focusBorder: '#005FB8',
  buttonBg: '#005FB8',
  buttonFg: '#FFFFFF',
  buttonHoverBg: '#0258A8',
  badgeBg: '#005FB8',
  badgeFg: '#FFFFFF',
  menuBg: '#FFFFFF',
  menuBorder: '#CECECE',
  widgetBg: '#F8F8F8',
  widgetShadow: 'rgba(0,0,0,0.16)',
  statusRemoteBg: '#005FB8',
  statusRemoteFg: '#FFFFFF',
  accent: '#005FB8',
  link: '#005FB8',
  terminalFg: '#3B3B3B',
  terminalFgDim: '#616161',
  terminalPrompt: '#107C10',
  scrollbar: '#646464',
  syntax: LIGHT_SYNTAX,
};

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}

/** Blend `hex` toward `target` by t in [0,1]. Falls back to `hex` on parse failure. */
export function mix(hex: string, target: string, t: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  if (!a || !b) return hex;
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Translucent version of a hex color. */
export function alpha(hex: string, a: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

/**
 * Build the IDE token set for the active site theme.
 *
 * 'dark' and 'clean' (the System pair) map exactly to Dark Modern and Light
 * Modern. Every other preset keeps its own background, foreground, and accent
 * while inheriting the structural values of the matching base palette.
 */
export function buildIdeTokens(resolvedId: string, preset: ThemePreset): IdeTokens {
  if (resolvedId === 'dark') return DARK_MODERN;
  if (resolvedId === 'clean') return LIGHT_MODERN;

  const isDark = luminance(preset.terminalBg) < 0.5;
  const base = isDark ? DARK_MODERN : LIGHT_MODERN;
  const editorBg = preset.terminalBg;
  const chromeBg = mix(editorBg, isDark ? '#000000' : '#000000', isDark ? 0.35 : 0.045);
  const fg = preset.text;
  const accent = preset.accent;
  const accentFg = luminance(accent) > 0.55 ? '#0A0A0A' : '#FFFFFF';

  return {
    ...base,
    isDark,
    chromeBg,
    chromeFg: fg,
    chromeFgDim: preset.textDim,
    border: mix(editorBg, isDark ? '#ffffff' : '#000000', isDark ? 0.14 : 0.16),
    editorBg,
    editorFg: fg,
    editorFgDim: preset.textDim,
    lineNumber: alpha(fg, 0.35),
    lineNumberActive: fg,
    lineHighlight: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    indentGuide: alpha(fg, 0.16),
    tabActiveBg: editorBg,
    tabInactiveBg: chromeBg,
    tabActiveFg: fg,
    tabInactiveFg: preset.textDim,
    tabActiveBorderTop: accent,
    listHoverBg: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.055)',
    listActiveBg: alpha(accent, isDark ? 0.32 : 0.18),
    listActiveFg: fg,
    inputBg: mix(editorBg, isDark ? '#ffffff' : '#000000', 0.06),
    inputBorder: mix(editorBg, isDark ? '#ffffff' : '#000000', 0.18),
    focusBorder: accent,
    buttonBg: accent,
    buttonFg: accentFg,
    buttonHoverBg: mix(accent, isDark ? '#ffffff' : '#000000', 0.12),
    badgeBg: accent,
    badgeFg: accentFg,
    menuBg: mix(editorBg, isDark ? '#ffffff' : '#000000', isDark ? 0.03 : 0.0),
    menuBorder: mix(editorBg, isDark ? '#ffffff' : '#000000', 0.2),
    widgetBg: mix(editorBg, isDark ? '#ffffff' : '#000000', isDark ? 0.02 : 0.03),
    widgetShadow: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.18)',
    statusRemoteBg: accent,
    statusRemoteFg: accentFg,
    accent,
    link: isDark ? mix(accent, '#ffffff', 0.25) : accent,
    terminalFg: fg,
    terminalFgDim: preset.textDim,
    terminalPrompt: accent,
    scrollbar: preset.scrollbar,
    syntax: isDark ? DARK_SYNTAX : LIGHT_SYNTAX,
  };
}
