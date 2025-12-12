import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateFoliageData } from '../utils/geometry.ts';
import { COLORS, TreeMorphState } from '../types.ts';

const particleVertexShader = `
  uniform float uTime;
  uniform float uMorphFactor;
  uniform float uPixelRatio;

  attribute vec3 aTargetPosition;
  attribute float aRandom;

  varying float vAlpha;
  varying float vRandom;

  void main() {
    vRandom = aRandom;

    // Morph logic
    vec3 currentPos = mix(position, aTargetPosition, uMorphFactor);

    // Breathing / Wind
    float wind = sin(uTime * 2.0 + currentPos.y * 0.5) * 0.1 * uMorphFactor;
    currentPos.x += wind;
    currentPos.z += wind * 0.5;
    
    // Float effect
    float floatEffect = sin(uTime + aRandom * 10.0) * 0.5 * (1.0 - uMorphFactor);
    currentPos.y += floatEffect;

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation with safety check for z
    float zDist = max(1.0, -mvPosition.z); 
    gl_PointSize = (6.0 + aRandom * 5.0) * uPixelRatio * (15.0 / zDist);
    
    vAlpha = 0.7 + 0.3 * sin(uTime * 3.0 + aRandom * 100.0);
  }
`;

const particleFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uGoldColor;
  
  varying float vAlpha;
  varying float vRandom;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    vec3 finalColor = mix(uColor, uGoldColor, step(0.92, vRandom));
    finalColor += vec3(0.15) * glow;

    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  treeState: TreeMorphState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const count = 12000;
  const meshRef = useRef<THREE.Points>(null);
  const morphProgress = useRef(0);
  
  const { positions, targetPositions, randoms } = useMemo(() => generateFoliageData(count), []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorphFactor: { value: 0 },
    uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
    uColor: { value: new THREE.Color(COLORS.emerald) },
    uGoldColor: { value: new THREE.Color(COLORS.gold) },
  }), []);

  useFrame((state, delta) => {
    // Internal animation loop - no React re-renders!
    const target = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;
    const speed = 1.5;
    morphProgress.current = THREE.MathUtils.lerp(morphProgress.current, target, speed * delta);

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uMorphFactor.value = morphProgress.current;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTargetPosition" count={count} array={targetPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;