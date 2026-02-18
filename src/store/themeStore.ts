/**
 * @file themeStore.ts
 * @description Theme state and presets for the 3D workstation and overlay. Each preset defines
 * background, terminal, accent, podium, scrollbar, and scene colors. useActiveTheme returns
 * the current preset object for consumers.
 */

import { create } from 'zustand';

/**
 * Theme preset definition — controls all colors in the 3D workstation scene.
 */
export interface ThemePreset {
  name: string;
  bg: string;           // site/scene background
  terminalBg: string;   // terminal window background
  terminalBorder: string;
  text: string;         // terminal text color
  textDim: string;      // terminal dim text
  accent: string;       // accent / glow color
  particles: string;    // background particles / stars
  podiumColor: string;
  podiumMetalness: number;
  podiumRoughness: number;
  podiumEmissive: string;
  podiumEmissiveIntensity: number;
  ringColor: string;    // platform ring color
  scrollbar: string;
  projectBorder: string;
  projectBg: string;
  fogColor: string;
  floorColor: string;
  spotlightColor: string;
  glowColor: string;    // point light glow on objects
}

export const themePresets: Record<string, ThemePreset> = {
  clean: {
    name: 'Modern',
    bg: '#ffffff',
    terminalBg: '#ffffff',
    terminalBorder: '#0a0a0a',
    text: '#0a0a0a',
    textDim: 'rgba(10,10,10,0.5)',
    accent: '#0a0a0a',
    particles: '#0a0a0a',
    podiumColor: '#0a0a0a',
    podiumMetalness: 0.9,
    podiumRoughness: 0.1,
    podiumEmissive: '#222222',
    podiumEmissiveIntensity: 0.05,
    ringColor: '#333333',
    scrollbar: '#0a0a0a',
    projectBorder: 'rgba(10,10,10,0.15)',
    projectBg: '#ffffff',
    fogColor: '#ffffff',
    floorColor: '#e8e8e8',
    spotlightColor: '#ffffff',
    glowColor: '#666666',
  },
  classic: {
    name: 'CRT',
    bg: '#000000',
    terminalBg: '#050505',
    terminalBorder: '#224422',
    text: '#33FF00',
    textDim: '#008F11',
    accent: '#33FF00',
    particles: '#224422',
    podiumColor: '#33FF00',
    podiumMetalness: 0.8,
    podiumRoughness: 0.2,
    podiumEmissive: '#33FF00',
    podiumEmissiveIntensity: 0.05,
    ringColor: '#33FF00',
    scrollbar: '#224422',
    projectBorder: '#224422',
    projectBg: '#0F1C0F',
    fogColor: '#000000',
    floorColor: '#050505',
    spotlightColor: '#224422',
    glowColor: '#33FF00',
  },
  blue: {
    name: 'Sky',
    bg: '#5E9BCF',
    terminalBg: '#E0F2FF', // Lighter sky blue terminal
    terminalBorder: '#73AEDE',
    text: '#003D73',
    textDim: '#406080',
    accent: '#73AEDE',
    particles: '#73AEDE',
    podiumColor: '#003D73',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#90C9F5',
    podiumEmissiveIntensity: 0.06,
    ringColor: '#90C9F5',
    scrollbar: '#73AEDE',
    projectBorder: '#73AEDE',
    projectBg: '#90C9F5',
    fogColor: '#5E9BCF',
    floorColor: '#90C9F5',
    spotlightColor: '#B8DFFF',
    glowColor: '#73AEDE',
  },
  pink: {
    name: 'Cherry Blossom',
    bg: '#CF7896',
    terminalBg: '#FFE0ED', // Lighter pink terminal
    terminalBorder: '#E38AAA',
    text: '#660022',
    textDim: '#994D66',
    accent: '#E38AAA',
    particles: '#E38AAA',
    podiumColor: '#660022',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#FFC2D9',
    podiumEmissiveIntensity: 0.06,
    ringColor: '#F5A3C1',
    scrollbar: '#E38AAA',
    projectBorder: '#E38AAA',
    projectBg: '#F5A3C1',
    fogColor: '#CF7896',
    floorColor: '#F5A3C1',
    spotlightColor: '#FFC2D9',
    glowColor: '#E38AAA',
  },
  purple: {
    name: 'Nova',
    bg: '#9B8CC4',
    terminalBg: '#E5DFF5',
    terminalBorder: '#8676B0',
    text: '#2D1F4E',
    textDim: '#5F5180',
    accent: '#8676B0',
    particles: '#8676B0',
    podiumColor: '#2D1F4E',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#E5DFF5',
    podiumEmissiveIntensity: 0.06,
    ringColor: '#D1C4E9',
    scrollbar: '#8676B0',
    projectBorder: '#8676B0',
    projectBg: '#D1C4E9',
    fogColor: '#9B8CC4',
    floorColor: '#D1C4E9',
    spotlightColor: '#E5DFF5',
    glowColor: '#8676B0',
  },
  uga: {
    name: 'Bulldog Red',
    bg: '#FFF0F2', // Scene background (light red on desktop; mobile uses accent)
    terminalBg: '#ffffff', // White terminal
    terminalBorder: '#BA0C2F', // Official Bulldog Red accent
    text: '#0a0a0a', // Black text on white terminal
    textDim: 'rgba(10,10,10,0.5)', // Dim text on white
    accent: '#BA0C2F',
    particles: '#BA0C2F',
    podiumColor: '#BA0C2F',
    podiumMetalness: 0.8,
    podiumRoughness: 0.2,
    podiumEmissive: '#BA0C2F',
    podiumEmissiveIntensity: 0.1,
    ringColor: '#BA0C2F',
    scrollbar: '#BA0C2F',
    projectBorder: 'rgba(10,10,10,0.15)', // Subtle on white
    projectBg: '#ebcacf', // Slightly lighter
    fogColor: '#000000',
    floorColor: '#050505',
    spotlightColor: '#FFFFFF',
    glowColor: '#BA0C2F',
  },
  grayBlue: {
    name: 'Apollo',
    bg: '#3d4f66', // Darker gray-blue scene
    terminalBg: '#5c6d85', // Darker gray-blue terminal
    terminalBorder: '#6b7c94',
    text: '#e8ecf1', // Light text on dark terminal
    textDim: 'rgba(232,236,241,0.6)',
    accent: '#8a9bb5',
    particles: '#6b7c94',
    podiumColor: '#4a5d75',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#5c6d85',
    podiumEmissiveIntensity: 0.06,
    ringColor: '#6b7c94',
    scrollbar: '#6b7c94',
    projectBorder: 'rgba(232,236,241,0.15)',
    projectBg: '#4a5d75',
    fogColor: '#3d4f66',
    floorColor: '#4a5d75',
    spotlightColor: '#6b7c94',
    glowColor: '#8a9bb5',
  },
};

interface ThemeState {
  activeTheme: string;
  setTheme: (themeId: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  activeTheme: 'clean',
  setTheme: (themeId: string) => {
    if (themePresets[themeId]) {
      set({ activeTheme: themeId });
    }
  },
}));

/**
 * Convenience selector — returns the full theme preset object
 */
export const useActiveTheme = (): ThemePreset => {
  const activeTheme = useThemeStore((s) => s.activeTheme);
  return themePresets[activeTheme] ?? themePresets.clean;
};
