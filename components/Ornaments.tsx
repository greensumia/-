import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateOrnamentData } from '../utils/geometry.ts';
import { TreeMorphState } from '../types.ts';

interface OrnamentsProps {
  type: 'heavy' | 'light';
  count: number;
  treeState: TreeMorphState;
  color: string;
}

const Ornaments: React.FC<OrnamentsProps> = ({ type, count, treeState, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => generateOrnamentData(count, type), [count, type]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const morphProgress = useRef(0);

  // Pre-allocate vector for calculations to avoid GC
  const currentPos = useMemo(() => new THREE.Vector3(), []);
  const treePosVec = useMemo(() => new THREE.Vector3(), []);
  const scatterPosVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Animation Logic
    const target = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;
    const speed = 1.5;
    morphProgress.current = THREE.MathUtils.lerp(morphProgress.current, target, speed * delta);
    const morphFactor = morphProgress.current;

    const time = state.clock.getElapsedTime();

    data.forEach((item, i) => {
      // Set Vectors
      treePosVec.set(...(item.treePosition as [number, number, number]));
      scatterPosVec.set(...(item.scatterPosition as [number, number, number]));

      // Physics Weight simulation
      const floatSpeed = type === 'heavy' ? 0.5 : 1.2;
      const floatAmp = type === 'heavy' ? 0.2 : 0.5;
      
      // Floating effect when scattered
      const floatingY = Math.sin(time * floatSpeed + i) * floatAmp * (1 - morphFactor);
      scatterPosVec.y += floatingY;
      
      // Rotation effect
      dummy.rotation.set(
        item.rotation[0] + time * (1 - morphFactor) * 0.5,
        item.rotation[1] + time * (1 - morphFactor) * 0.5,
        item.rotation[2]
      );

      // Lerp Position
      currentPos.lerpVectors(scatterPosVec, treePosVec, morphFactor);
      
      dummy.position.copy(currentPos);
      dummy.scale.setScalar(item.scale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {type === 'heavy' ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : (
        <sphereGeometry args={[1, 32, 32]} />
      )}
      <meshStandardMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.9} 
        emissive={color}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};

export default Ornaments;