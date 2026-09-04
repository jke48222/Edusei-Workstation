/**
 * @file projectModels.ts
 * @description Which project opens as a 3D model, and where that model lives.
 *
 * Kept separate from ModelViewer so the editor can ask "does this file have a
 * model?" to pick a layout without pulling three.js into the initial bundle.
 */

import { getIdeProject } from './projectRegistry';
import type { ProjectId } from './projectRegistry';

/**
 * Projects whose editor model is deliberately not their tile media. Kitchen
 * Chaos VR's tile is a gameplay clip, but the workstation has opened it as the
 * Quest 3 headset since the original 3D scene — that stays.
 */
const MODEL_OVERRIDES: Record<ProjectId, string> = {
  'kitchen-chaos-vr': '/models/quest3.glb',
};

/** The GLB a project opens as, or undefined if it has no model. */
export function modelUrlFor(id: ProjectId): string | undefined {
  const override = MODEL_OVERRIDES[id];
  if (override) return override;
  const media = getIdeProject(id)?.project.tileMedia;
  return media?.kind === 'model' ? media.src : undefined;
}
