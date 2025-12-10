import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateFoliageData } from '../utils/geometry';
import { COLORS } from '../types';

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

    // Morph logic: Linear interpolation between position (scatter) and aTargetPosition (tree)
    vec3 currentPos = mix(position, aTargetPosition, uMorphFactor);

    // Add "Breathing" / Wind effect based on time
    // More intense when formed (uMorphFactor near 1)
    float wind = sin(uTime * 2.0 + currentPos.y * 0.5) * 0.1 * uMorphFactor;
    currentPos.x += wind;
    currentPos.z += wind * 0.5;
    
    // Float effect when scattered
    float floatEffect = sin(uTime + aRandom * 10.0) * 0.5 * (1.0 - uMorphFactor);
    currentPos.y += floatEffect;

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation - Increased base size for fuller/fatter look
    gl_PointSize = (6.0 + aRandom * 5.0) * uPixelRatio * (15.0 / -mvPosition.z);
    
    // Alpha fade based on distance/glint
    vAlpha = 0.7 + 0.3 * sin(uTime * 3.0 + aRandom * 100.0);
  }
`;

const particleFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uGoldColor;
  
  varying float vAlpha;
  varying float vRandom;

  void main() {
    // Circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    // Soft edge
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    // Mix emerald green with gold sparkles based on random attribute
    // slightly reduced gold threshold to ensure green dominance
    vec3 finalColor = mix(uColor, uGoldColor, step(0.92, vRandom));
    
    // Extra brightness for center
    finalColor += vec3(0.15) * glow;

    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  morphFactor: number;
}

const Foliage: React.FC<FoliageProps> = ({ morphFactor }) => {
  const count = 12000;
  const meshRef = useRef<THREE.Points>(null);
  
  // Generate data once
  const { positions, targetPositions, randoms } = useMemo(() => generateFoliageData(count), []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorphFactor: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColor: { value: new THREE.Color(COLORS.emerald) },
    uGoldColor: { value: new THREE.Color(COLORS.gold) },
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      // Update Uniforms
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Smoothly interpolate the morph factor visually if needed, 
      // but here we trust the parent passes a smooth value or we animate it here.
      // We will assign the prop directly to uniform for responsiveness.
      material.uniforms.uMorphFactor.value = morphFactor;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTargetPosition"
          count={count}
          array={targetPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
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