import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import * as THREE from 'three';
import { getRandomSpherePoint } from '../utils/geometry.ts';
import { COLORS, SCATTER_RADIUS, TREE_HEIGHT, TreeMorphState } from '../types.ts';

interface StarTopProps {
  treeState: TreeMorphState;
}

const StarTop: React.FC<StarTopProps> = ({ treeState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const morphProgress = useRef(0);
  
  const treeY = (TREE_HEIGHT / 2) + 0.5;
  const targetPos = useMemo(() => new THREE.Vector3(0, treeY, 0), [treeY]);
  const startPos = useMemo(() => getRandomSpherePoint(SCATTER_RADIUS), []);
  const currentPos = useMemo(() => new THREE.Vector3(), []);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.0;
    const innerRadius = 0.5; 
    const numPoints = 5;
    const angleOffset = Math.PI / 2;

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

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const target = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;
    const speed = 1.5;
    morphProgress.current = THREE.MathUtils.lerp(morphProgress.current, target, speed * delta);
    const morphFactor = morphProgress.current;

    const time = state.clock.getElapsedTime();

    // Position Interpolation
    currentPos.lerpVectors(startPos, targetPos, morphFactor);
    
    // Add a slight hover effect when formed
    if (morphFactor > 0.9) {
      currentPos.y += Math.sin(time * 2) * 0.1;
    }

    groupRef.current.position.copy(currentPos);

    // Rotation
    const rotationSpeed = THREE.MathUtils.lerp(5, 0.8, morphFactor);
    groupRef.current.rotation.y += rotationSpeed * 0.01;
    groupRef.current.rotation.z = Math.sin(time) * 0.05 * morphFactor;

    // Pulse emission
    if (materialRef.current) {
        materialRef.current.emissiveIntensity = 2.5 + Math.sin(time * 3) * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
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
      
      {/* Halo */}
      <mesh scale={[2.5, 2.5, 2.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color={COLORS.gold} 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight 
        color={COLORS.gold} 
        intensity={3} 
        distance={15} 
        decay={2} 
      />
    </group>
  );
};

export default StarTop;