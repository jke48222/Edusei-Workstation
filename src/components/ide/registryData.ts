import { themePresets, SYSTEM_THEME_ID } from '../../store/themeStore';

/** Single import surface for the site data the IDE needs. */
export {
  profileData,
  projectsData,
  skillsData,
  getSayHiMailto,
  getBootSequence,
  getAllProjectsForWork,
  helpText,
} from '../../data';

/* ------------------------------------------------------------------ */
/* Theme name plumbing shared by the terminal, menus, and palette      */
/* ------------------------------------------------------------------ */

export function toThemeCommand(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

export const THEME_NAME_TO_ID: Record<string, string> = {
  light: 'clean',
  modern: 'clean',
  dark: 'dark',
  crt: 'classic',
  classic: 'classic',
  sky: 'blue',
  blue: 'blue',
  cherry: 'pink',
  cherryblossom: 'pink',
  pink: 'pink',
  nova: 'purple',
  purple: 'purple',
  bulldog: 'uga',
  bulldogred: 'uga',
  uga: 'uga',
  red: 'uga',
  apollo: 'grayBlue',
  grayblue: 'grayBlue',
  greyblue: 'grayBlue',
  system: SYSTEM_THEME_ID,
  secret: 'gold',
  golden: 'gold',
};

/** The switchable themes, in picker order (gold stays a secret). */
export const THEME_CHOICE_IDS = ['clean', 'dark', 'classic', 'blue', 'pink', 'purple', 'uga', 'grayBlue'] as const;

export interface ThemeChoice {
  id: string;
  name: string;
}

export function themeChoices(): ThemeChoice[] {
  return [
    { id: SYSTEM_THEME_ID, name: 'System (follow OS)' },
    ...THEME_CHOICE_IDS.map((id) => ({ id, name: themePresets[id].name })),
  ];
}

export function themeCommandNames(): string[] {
  return ['system', ...THEME_CHOICE_IDS.map((id) => toThemeCommand(themePresets[id].name))];
}

export function resolveThemeCommand(name: string): string | undefined {
  const normalized = toThemeCommand(name);
  return (
    THEME_NAME_TO_ID[normalized] ??
    THEME_NAME_TO_ID[name] ??
    Object.keys(themePresets).find((id) => toThemeCommand(themePresets[id].name) === normalized)
  );
}
