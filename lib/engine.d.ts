import type { Project } from './content';

/** Starts the 3D hero, game and transitions. Returns a cleanup function. */
export function initRetroSite(works: Project[]): (() => void) | undefined;
