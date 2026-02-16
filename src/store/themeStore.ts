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
    bg: '#030303',
    terminalBg: '#0c0c0c',
    terminalBorder: 'rgba(74,222,128,0.12)',
    text: '#4ade80',
    textDim: 'rgba(74,222,128,0.4)',
    accent: '#4ade80',
    particles: '#4ade80',
    podiumColor: '#0a0a0a',
    podiumMetalness: 0.8,
    podiumRoughness: 0.2,
    podiumEmissive: '#4ade80',
    podiumEmissiveIntensity: 0.05,
    ringColor: '#4ade80',
    scrollbar: '#4ade80',
    projectBorder: 'rgba(74,222,128,0.1)',
    projectBg: 'rgba(74,222,128,0.02)',
    fogColor: '#030303',
    floorColor: '#050505',
    spotlightColor: '#ffffff',
    glowColor: '#4ade80',
  },
  blue: {
    name: 'Sky',
    bg: '#e8f4fd',
    terminalBg: '#f0f8ff',
    terminalBorder: '#5ba3d9',
    text: '#1a5276',
    textDim: 'rgba(26,82,118,0.5)',
    accent: '#90c9f5',
    particles: '#5ba3d9',
    podiumColor: '#1a3a5c',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#90c9f5',
    podiumEmissiveIntensity: 0.06,
    ringColor: '#90c9f5',
    scrollbar: '#5ba3d9',
    projectBorder: 'rgba(90,201,245,0.25)',
    projectBg: '#f0f8ff',
    fogColor: '#e8f4fd',
    floorColor: '#d0e8f8',
    spotlightColor: '#e0f0ff',
    glowColor: '#90c9f5',
  },
  pink: {
    name: 'Cherry Blossom',
    bg: '#fdf2f5',
    terminalBg: '#fff5f7',
    terminalBorder: '#d4849a',
    text: '#6b2640',
    textDim: 'rgba(107,38,64,0.5)',
    accent: '#f5bcce',
    particles: '#d4849a',
    podiumColor: '#4a1a2e',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#f5bcce',
    podiumEmissiveIntensity: 0.06,
    ringColor: '#f5bcce',
    scrollbar: '#d4849a',
    projectBorder: 'rgba(245,188,206,0.3)',
    projectBg: '#fff5f7',
    fogColor: '#fdf2f5',
    floorColor: '#f5dde5',
    spotlightColor: '#fff0f5',
    glowColor: '#f5bcce',
  },
  purple: {
    name: 'Nova',
    bg: '#f3f0fb',
    terminalBg: '#f7f5fc',
    terminalBorder: '#9b8cc4',
    text: '#3d2d6b',
    textDim: 'rgba(61,45,107,0.5)',
    accent: '#cbbcf5',
    particles: '#9b8cc4',
    podiumColor: '#2d1f4e',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#cbbcf5',
    podiumEmissiveIntensity: 0.06,
    ringColor: '#cbbcf5',
    scrollbar: '#9b8cc4',
    projectBorder: 'rgba(203,188,245,0.3)',
    projectBg: '#f7f5fc',
    fogColor: '#f3f0fb',
    floorColor: '#e5dff5',
    spotlightColor: '#f0ecff',
    glowColor: '#cbbcf5',
  },
  uga: {
    name: 'Bulldog Red',
    bg: '#1a0a0a',
    terminalBg: '#1c0e0e',
    terminalBorder: 'rgba(186,12,47,0.3)',
    text: '#e85d75',
    textDim: 'rgba(232,93,117,0.4)',
    accent: '#BA0C2F',
    particles: '#e85d75',
    podiumColor: '#1a0a0a',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#BA0C2F',
    podiumEmissiveIntensity: 0.08,
    ringColor: '#BA0C2F',
    scrollbar: '#BA0C2F',
    projectBorder: 'rgba(186,12,47,0.2)',
    projectBg: 'rgba(186,12,47,0.04)',
    fogColor: '#1a0a0a',
    floorColor: '#120808',
    spotlightColor: '#ffcccc',
    glowColor: '#e85d75',
  },
  grayBlue: {
    name: 'Apollo',
    bg: '#21242f',
    terminalBg: '#1a1d27',
    terminalBorder: 'rgba(130,150,190,0.2)',
    text: '#a0b4d0',
    textDim: 'rgba(160,180,208,0.4)',
    accent: '#6b8ab8',
    particles: '#6b8ab8',
    podiumColor: '#151820',
    podiumMetalness: 0.85,
    podiumRoughness: 0.15,
    podiumEmissive: '#6b8ab8',
    podiumEmissiveIntensity: 0.05,
    ringColor: '#6b8ab8',
    scrollbar: '#6b8ab8',
    projectBorder: 'rgba(107,138,184,0.15)',
    projectBg: 'rgba(107,138,184,0.04)',
    fogColor: '#21242f',
    floorColor: '#181b24',
    spotlightColor: '#d0e0ff',
    glowColor: '#6b8ab8',
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
