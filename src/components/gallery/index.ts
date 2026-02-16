/**
 * @file index.ts
 * @description Public exports for the gallery/VR experience: GalleryExperience, avatar,
 * islands, video stage, Spirit Oasis, post-processing, gaze bridge, transition portal, etc.
 */
export { GalleryExperience, GalleryKeyboardHandler, GalleryLoadingState } from './GalleryExperience';
export { Avatar } from './Avatar';
export { AvatarController } from './AvatarController';
export { VideoStage, VideoStageGroup } from './VideoStage';
export { SpiritOasis } from './SpiritOasis';
export { SkyGradient } from './SkyGradient';
export { FloatingIsland } from './FloatingIsland';
export { GalleryPostProcessing } from './GalleryPostProcessing';
export { SpiritTree } from './SpiritTree';
export { PetalParticles } from './PetalParticles';
export { KoiPond } from './KoiPond';
export { ProjectIsland, ProjectIslandGroup } from './ProjectIsland';
export { GazeBridge, GazeBridgeGroup } from './GazeBridge';
export { GazeIndicator } from './GazeIndicator';
export { CharacterAvatar } from './CharacterAvatar';
export { SpatialAudioManager } from './SpatialAudioManager';
export { TransitionPortal, useDissolveEffect, createDissolveMaterial } from './TransitionPortal';
