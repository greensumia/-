import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import * as THREE from 'three';
import { getRandomSpherePoint } from '../utils/geometry';
import { COLORS, SCATTER_RADIUS, TREE_HEIGHT } from '../types';

interface StarTopProps {
  morphFactor: number;
}

const StarTop: React.FC<StarTopProps> = ({ morphFactor }) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Target position is at the very top of the tree
  // Tree goes from -height/2 to height/2. 
  // Adjusted slightly higher to account for star size so it sits nicely on top
  const treeY = (TREE_HEIGHT / 2) + 0.5;
  const targetPos = useMemo(() => new THREE.Vector3(0, treeY, 0), [treeY]);
  
  // Start position is random scattered
  const startPos = useMemo(() => getRandomSpherePoint(SCATTER_RADIUS), []);
  
  const currentPos = useMemo(() => new THREE.Vector3(), []);

  // Generate 5-pointed star shape
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.0;
    const innerRadius = 0.5; // Classic 5-point star ratio
    const numPoints = 5;
    const angleOffset = Math.PI / 2; // Start at 12 o'clock (Up)

    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = angleOffset + (i * Math.PI) / numPoints;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.05,
    bevelSegments: 3,
  }), []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Position Interpolation
    currentPos.lerpVectors(startPos, targetPos, morphFactor);
    
    // Add a slight hover effect when formed
    if (morphFactor > 0.9) {
      currentPos.y += Math.sin(time * 2) * 0.1;
    }

    groupRef.current.position.copy(currentPos);

    // Rotation: Spin fast when scattered, slow majestic spin when formed
    const rotationSpeed = THREE.MathUtils.lerp(5, 0.8, morphFactor);
    groupRef.current.rotation.y += rotationSpeed * 0.01;
    
    // Add a little wobble
    groupRef.current.rotation.z = Math.sin(time) * 0.05 * morphFactor;

    // Pulse emission intensity
    if (materialRef.current) {
        // High intensity pulse for that cinematic glow
        materialRef.current.emissiveIntensity = 2.5 + Math.sin(time * 3) * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 5-Pointed Star Mesh - Centered to ensure rotation is symmetrical */}
      <Center>
        <mesh castShadow>
          <extrudeGeometry args={[starShape, extrudeSettings]} />
          <meshStandardMaterial 
            ref={materialRef}
            color={COLORS.gold}
            emissive={COLORS.gold}
            emissiveIntensity={2}
            roughness={0.0}
            metalness={1.0}
          />
        </mesh>
      </Center>
      
      {/* Halo / Glow effect */}
      <mesh scale={[2.5, 2.5, 2.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color={COLORS.gold} 
          transparent 
          opacity={0.15 * morphFactor} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Point light for the top area */}
      <pointLight 
        color={COLORS.gold} 
        intensity={3 * morphFactor} 
        distance={15} 
        decay={2} 
      />
    </group>
  );
};

export default StarTop;