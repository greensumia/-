import * as THREE from 'three';
import { SCATTER_RADIUS, TREE_HEIGHT, TREE_RADIUS_BASE } from '../types.ts';

// Helper to generate a random point inside a sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Helper to generate a point within a cone volume (The Tree)
// Using a spiral distribution for better aesthetic coverage
export const getTreePoint = (height: number, baseRadius: number, index: number, total: number): THREE.Vector3 => {
  // Normalized height (0 at bottom, 1 at top)
  const yNorm = index / total; 
  const y = (yNorm * height) - (height / 2); // Center vertically
  
  // Radius at this height
  const r = baseRadius * (1 - yNorm);
  
  // Golden angle for spiral
  const theta = index * 2.39996; 
  
  // Add some randomness to depth so it's a volume, not just a shell
  const rRandom = r * Math.sqrt(Math.random());

  return new THREE.Vector3(
    rRandom * Math.cos(theta),
    y,
    rRandom * Math.sin(theta)
  );
};

export const generateFoliageData = (count: number) => {
  const positions = new Float32Array(count * 3);
  const targetPositions = new Float32Array(count * 3);
  const randoms = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Tree Shape (Target)
    const treePos = getTreePoint(TREE_HEIGHT, TREE_RADIUS_BASE, i, count);
    
    // Scattered Shape (Initial)
    const scatterPos = getRandomSpherePoint(SCATTER_RADIUS);

    targetPositions[i * 3] = treePos.x;
    targetPositions[i * 3 + 1] = treePos.y;
    targetPositions[i * 3 + 2] = treePos.z;

    positions[i * 3] = scatterPos.x;
    positions[i * 3 + 1] = scatterPos.y;
    positions[i * 3 + 2] = scatterPos.z;

    randoms[i] = Math.random();
  }

  return { positions, targetPositions, randoms };
};

export const generateOrnamentData = (count: number, type: 'heavy' | 'light') => {
  const data = [];
  for (let i = 0; i < count; i++) {
    const treePos = getTreePoint(TREE_HEIGHT, type === 'heavy' ? TREE_RADIUS_BASE * 0.8 : TREE_RADIUS_BASE * 0.95, i, count);
    // Add jitter to tree pos so ornaments aren't perfectly aligned
    treePos.x += (Math.random() - 0.5) * 0.5;
    treePos.z += (Math.random() - 0.5) * 0.5;

    const scatterPos = getRandomSpherePoint(SCATTER_RADIUS);
    
    data.push({
      treePosition: [treePos.x, treePos.y, treePos.z],
      scatterPosition: [scatterPos.x, scatterPos.y, scatterPos.z],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: type === 'heavy' ? 0.3 + Math.random() * 0.3 : 0.15 + Math.random() * 0.15,
    });
  }
  return data;
};