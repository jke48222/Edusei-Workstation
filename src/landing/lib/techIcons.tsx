import {
  Hash, Sigma, CircuitBoard, Binary, Coffee, Box, PenTool, Mail, LayoutGrid, Rocket,
  FileText, Headset, Globe, Cpu, Brain, Bot, MessageSquare, Network, Braces, MessagesSquare,
  AudioLines, Satellite, Bluetooth, FlaskConical, Activity, Droplets, Radio, Layers, Sun,
  Gauge, AudioWaveform, Briefcase, Users, BarChart3, Lightbulb, MousePointerClick, Puzzle,
  Compass, ClipboardList, Timer, Flag, type LucideIcon,
} from "lucide-react";

/** A resolved icon: either a brand logo file in /public/icons, or a lucide fallback glyph. */
export type TechIcon = { file?: string; Lucide?: LucideIcon };

/**
 * Maps every skill label in data.ts → an icon. Brand marks (simple-icons, served from
 * /public/icons) are used where one exists; otherwise a tasteful lucide glyph stands in.
 */
const MAP: Record<string, TechIcon> = {
  // Current-stack additions (2026 refresh)
  'ARM Assembly': { Lucide: Binary },
  'HTML/CSS': { file: "html5" },
  Elixir: { Lucide: Droplets },
  GLSL: { Lucide: Layers },
  MicroPython: { file: "python" },
  Swift: { Lucide: Rocket },
  'AppKit / SwiftUI': { Lucide: LayoutGrid },
  Docker: { Lucide: Box },
  Kubernetes: { Lucide: Network },
  'GitHub Actions': { file: "github" },
  KiCad: { Lucide: CircuitBoard },
  'Phoenix / Ecto': { Lucide: Activity },
  PostgreSQL: { file: "postgresql" },
  'React Three Fiber': { file: "react" },
  'SQLite / FTS5': { Lucide: Binary },
  'three.js': { Lucide: Box },
  TinaCMS: { Lucide: FileText },
  'Unreal Engine 5': { Lucide: Box },
  Vite: { Lucide: Rocket },
  'Xilinx / Vivado': { Lucide: CircuitBoard },
  'Anthropic Claude API (Tool Use, Streaming, Structured Outputs)': { file: "claude" },
  'AI-Paired Development (Claude Code, Cursor)': { file: "claude" },
  'MCP Servers': { Lucide: Network },
  'Apple Foundation Models': { Lucide: Brain },
  'MLX On-Device Inference': { Lucide: Cpu },
  'Hybrid Retrieval (BM25 + Vector)': { Lucide: Compass },
  'BLE GATT (BlueZ / NimBLE / Core Bluetooth)': { Lucide: Bluetooth },
  'DSP (Butterworth, Kalman, Peak Detection)': { Lucide: AudioWaveform },
  'FPGA (Artix-7)': { Lucide: CircuitBoard },
  'HUB75 LED Matrices': { Lucide: LayoutGrid },
  'PCB Design (KiCad)': { Lucide: CircuitBoard },
  'Raspberry Pi 4 / 5': { file: "raspberrypi" },
  'Raspberry Pi Pico': { file: "raspberrypi" },
  'ngspice / Multisim Simulation': { Lucide: Activity },
  'Client Delivery (Discovery to Go-Live)': { Lucide: Flag },
  'Code Review': { Lucide: ClipboardList },
  'Automated Testing': { Lucide: Timer },

  // Programming
  Assembly: { Lucide: Binary },
  C: { file: "c" },
  "C#": { Lucide: Hash },
  "C++": { file: "cpp" },
  HTML: { file: "html5" },
  Java: { file: "java" },
  JavaFX: { Lucide: Coffee },
  JavaScript: { file: "javascript" },
  MATLAB: { Lucide: Sigma },
  Python: { file: "python" },
  R: { file: "r" },
  SQL: { file: "postgresql" },
  TypeScript: { file: "typescript" },
  Verilog: { Lucide: CircuitBoard },

  // Software & Tools
  "Autodesk Fusion 360": { file: "autodesk" },
  Blender: { file: "blender" },
  CAD: { Lucide: Box },
  Figma: { file: "figma" },
  Git: { file: "git" },
  GitHub: { file: "github" },
  "Graphic Design": { Lucide: PenTool },
  Klaviyo: { Lucide: Mail },
  "Microsoft Suite": { Lucide: LayoutGrid },
  "NASA F Prime": { Lucide: Rocket },
  "Next.js": { file: "nextjs" },
  "Node.js": { file: "nodejs" },
  PlatformIO: { file: "platformio" },
  "React Native": { file: "react" },
  "Sanity CMS": { Lucide: FileText },
  "Shopify Storefront API": { file: "shopify" },
  Supabase: { file: "supabase" },
  "Tailwind CSS": { file: "tailwind" },
  Unity3D: { file: "unity" },
  Vercel: { file: "vercel" },
  "VR/MR Development": { Lucide: Headset },
  "Website Development": { Lucide: Globe },
  Wix: { file: "wix" },
  WordPress: { file: "wordpress" },
  Xilinx: { Lucide: CircuitBoard },
  Zephyr: { Lucide: Cpu },

  // AI
  "Anthropic Claude API": { file: "claude" },
  "LLM Application Development": { Lucide: Brain },
  "AI Agents & Tool Use": { Lucide: Bot },
  "Prompt Engineering": { Lucide: MessageSquare },
  "REST-based AI Integration": { Lucide: Network },
  "Structured (JSON) Outputs": { Lucide: Braces },
  "Wit.ai Natural Language Understanding": { Lucide: MessagesSquare },
  "Speech Synthesis & Text-to-Speech": { Lucide: AudioLines },

  // Hardware
  "2U CubeSat": { Lucide: Satellite },
  "Basys2 FPGA Boards": { Lucide: CircuitBoard },
  "BLE / NimBLE": { Lucide: Bluetooth },
  "Cleanroom Microfabrication": { Lucide: FlaskConical },
  ESP32: { file: "espressif" },
  "Geophones & Load Cells": { Lucide: Activity },
  Microfluidics: { Lucide: Droplets },
  MQTT: { Lucide: Radio },
  "PDMS Soft Lithography": { Lucide: Layers },
  Photolithography: { Lucide: Sun },
  "Raspberry Pi Pico 2W": { file: "raspberrypi" },
  "Raspberry Pi 4": { file: "raspberrypi" },
  Sensors: { Lucide: Gauge },
  "Signal Processing": { Lucide: AudioWaveform },
  "STM32 Microcontrollers": { file: "stm" },

  // Core
  "Business Case Development": { Lucide: Briefcase },
  Collaboration: { Lucide: Users },
  "Data Analysis": { Lucide: BarChart3 },
  "Critical Thinking": { Lucide: Lightbulb },
  "Human-Computer Interaction": { Lucide: MousePointerClick },
  "Problem Solving": { Lucide: Puzzle },
  "Product Strategy": { Lucide: Compass },
  "Project Management": { Lucide: ClipboardList },
  "Real-Time Systems": { Lucide: Timer },
  "Strategic Leadership": { Lucide: Flag },
  "Technical Communication": { Lucide: MessageSquare },
};

export function resolveTechIcon(label: string): TechIcon {
  return MAP[label] ?? { Lucide: Box };
}

/** Renders a skill's icon at 16px: brand logo (img) or lucide glyph. */
export function TechGlyph({ label, className = "h-[15px] w-[15px]" }: { label: string; className?: string }) {
  const icon = resolveTechIcon(label);
  if (icon.file) {
    return <img src={`/icons/${icon.file}.svg`} alt="" aria-hidden loading="lazy" className={`${className} object-contain opacity-80`} />;
  }
  const L = icon.Lucide ?? Box;
  return <L className={`${className} text-ink-mute`} strokeWidth={1.8} />;
}
