import { Ide } from './ide/Ide';

/**
 * The workstation overlay is a full-viewport professional IDE (VS Code-style
 * chrome). Opening a project file makes the editor viewport transparent so the
 * 3D scene behind renders as the file's contents.
 */
export function Overlay() {
  return <Ide />;
}
