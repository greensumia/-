import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateFoliageData } from '../utils/geometry';

const vertexShader = `
  uniform float uTime;
  uniform float uMorphFactor;
  uniform float uPixelRatio;

  attribute vec3 aTargetPosition;
  attribute float aPhase;
  attribute float aSpeed;

  varying float vAlpha;

  void main() {
    // Morph logic: Linear interpolation between position (scatter) and aTargetPosition (tree)
    vec3 currentPos = mix(position, aTargetPosition, uMorphFactor);
    
    // Add breathing motion
    float breath = sin(uTime * 1.5 + currentPos.y) * 0.05 * uMorphFactor;
    currentPos += normalize(currentPos) * breath;

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation - slightly larger than foliage for visibility
    gl_PointSize = 15.0 * uPixelRatio * (12.0 / -mvPosition.z);
    
    // Twinkle calculation
    // Sine wave for smooth blinking
    float blink = 0.5 + 0.5 * sin(uTime * aSpeed + aPhase);
    // Power curve for sharper "sparkle" feel
    blink = pow(blink, 3.0);
    
    vAlpha = blink;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    // Soft glow gradient
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.0);

    // Output color with high intensity for bloom
    gl_FragColor = vec4(uColor, glow * vAlpha);
  }
`;

interface TwinkleLightsProps {
  morphFactor: number;
}

const TwinkleLights: React.FC<TwinkleLightsProps> = ({ morphFactor }) => {
  const count = 1500;
  const meshRef = useRef<THREE.Points>(null);

  // Reuse foliage data generator to get points within the tree volume
  const { positions, targetPositions } = useMemo(() => generateFoliageData(count), []);
  
  // Custom attributes for twinkling animation
  const { phases, speeds } = useMemo(() => {
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    for(let i=0; i<count; i++) {
        phases[i] = Math.random() * Math.PI * 2;
        speeds[i] = 2.0 + Math.random() * 5.0; // Random twinkle speed
    }
    return { phases, speeds };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorphFactor: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    // Warm light color, multiplied for bloom intensity (>1.0)
    uColor: { value: new THREE.Color('#fffae3').multiplyScalar(3.0) }, 
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uMorphFactor.value = morphFactor;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTargetPosition" count={count} array={targetPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aPhase" count={count} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default TwinkleLights;