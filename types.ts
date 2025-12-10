export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface DualPosition {
  treePosition: [number, number, number];
  scatterPosition: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export const COLORS = {
  emerald: '#065f46', // Richer, more visible deep green
  emeraldLight: '#10b981',
  gold: '#FFD700',
  goldDark: '#C5A059',
  redDeep: '#881122',
};

// Animation constants
export const SCATTER_RADIUS = 15;
export const TREE_HEIGHT = 12;
export const TREE_RADIUS_BASE = 7.5; // Significantly wider base (Fatter tree)