import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateFoliageData } from '../utils/geometry.ts';
import { TreeMorphState } from '../types.ts';

const vertexShader = `
  uniform float uTime;
  uniform float uMorphFactor;
  uniform float uPixelRatio;

  attribute vec3 aTargetPosition;
  attribute float aPhase;
  attribute float aSpeed;

  varying float vAlpha;

  void main() {
    vec3 currentPos = mix(position, aTargetPosition, uMorphFactor);
    
    float breath = sin(uTime * 1.5 + currentPos.y) * 0.05 * uMorphFactor;
    currentPos += normalize(currentPos) * breath;

    vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float zDist = max(1.0, -mvPosition.z);
    gl_PointSize = 15.0 * uPixelRatio * (12.0 / zDist);
    
    float blink = 0.5 + 0.5 * sin(uTime * aSpeed + aPhase);
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

    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.0);

    gl_FragColor = vec4(uColor, glow * vAlpha);
  }
`;

interface TwinkleLightsProps {
  treeState: TreeMorphState;
}

const TwinkleLights: React.FC<TwinkleLightsProps> = ({ treeState }) => {
  const count = 1500;
  const meshRef = useRef<THREE.Points>(null);
  const morphProgress = useRef(0);

  const { positions, targetPositions } = useMemo(() => generateFoliageData(count), []);
  
  const { phases, speeds } = useMemo(() => {
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    for(let i=0; i<count; i++) {
        phases[i] = Math.random() * Math.PI * 2;
        speeds[i] = 2.0 + Math.random() * 5.0;
    }
    return { phases, speeds };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorphFactor: { value: 0 },
    uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
    uColor: { value: new THREE.Color('#fffae3').multiplyScalar(3.0) }, 
  }), []);

  useFrame((state, delta) => {
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