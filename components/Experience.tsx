import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import StarTop from './StarTop';
import TwinkleLights from './TwinkleLights';
import { TreeMorphState, COLORS } from '../types';

interface ExperienceProps {
  treeState: TreeMorphState;
}

const SceneContent: React.FC<ExperienceProps> = ({ treeState }) => {
  const [currentMorphFactor, setCurrentMorphFactor] = useState(0);
  
  // Smoothly interpolate the morph factor in the frame loop for the entire scene
  useFrame((_, delta) => {
    const target = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;
    // Lerp speed: controls how fast the transition happens
    // Using a simple lerp for smoothness
    const speed = 2.0;
    const diff = target - currentMorphFactor;
    
    if (Math.abs(diff) > 0.001) {
      setCurrentMorphFactor(prev => THREE.MathUtils.lerp(prev, target, speed * delta));
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 28]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={45}
        autoRotate={treeState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.5}
        target={[0, 2, 0]} // Focus slightly higher to frame the star and body
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      {/* Green fill from below/side to emphasize foliage */}
      <hemisphereLight args={[COLORS.emeraldLight, '#000000', 0.5]} />
      
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1.5} 
        color={COLORS.gold} 
        castShadow 
      />
      {/* Increased intensity for the green light */}
      <pointLight position={[-10, 10, -10]} intensity={3.5} color={COLORS.emeraldLight} distance={40} />
      <pointLight position={[0, -5, 5]} intensity={0.5} color="#ffffff" />

      {/* Environment for reflections */}
      <Environment preset="city" environmentIntensity={0.5} />

      {/* The Tree Components - Lifted group to ensure visibility above bottom UI if needed */}
      <group position={[0, -2, 0]}>
        {/* Star Top */}
        <StarTop morphFactor={currentMorphFactor} />

        {/* Twinkle Lights - Added Here */}
        <TwinkleLights morphFactor={currentMorphFactor} />

        {/* Needle/Leaf Particles */}
        <Foliage morphFactor={currentMorphFactor} />

        {/* Gold Balls (Light) */}
        <Ornaments 
          type="light" 
          count={200} 
          morphFactor={currentMorphFactor} 
          color={COLORS.gold} 
        />
        
        {/* Red/Emerald Gift Boxes (Heavy) */}
        <Ornaments 
          type="heavy" 
          count={50} 
          morphFactor={currentMorphFactor} 
          color={COLORS.redDeep} 
        />
        
        {/* Extra Sparkle Ornaments */}
        <Ornaments 
          type="light" 
          count={100} 
          morphFactor={currentMorphFactor} 
          color="#ffffff" 
        />
      </group>

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Post Processing - Set multisampling to 0 for better stability */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

const Experience: React.FC<ExperienceProps> = (props) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, // ToneMapping handles smoothing usually, disabling AA for Bloom perf
        toneMapping: THREE.ReinhardToneMapping,
        toneMappingExposure: 1.5
      }}
      shadows
    >
      <color attach="background" args={['#010604']} />
      <fog attach="fog" args={['#010604', 10, 50]} />
      <SceneContent {...props} />
    </Canvas>
  );
};

export default Experience;