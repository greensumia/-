import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage.tsx';
import Ornaments from './Ornaments.tsx';
import StarTop from './StarTop.tsx';
import TwinkleLights from './TwinkleLights.tsx';
import { TreeMorphState, COLORS } from '../types.ts';

interface ExperienceProps {
  treeState: TreeMorphState;
}

// TreeGroup now just passes the state down, no internal state updates!
const TreeGroup: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <group position={[0, 0, 0]}>
      <StarTop treeState={treeState} />
      <TwinkleLights treeState={treeState} />
      <Foliage treeState={treeState} />
      <Ornaments type="light" count={200} treeState={treeState} color={COLORS.gold} />
      <Ornaments type="heavy" count={50} treeState={treeState} color={COLORS.redDeep} />
      <Ornaments type="light" count={120} treeState={treeState} color="#eef" />
    </group>
  );
};

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        powerPreference: "high-performance",
        alpha: false, // Ensure canvas is opaque
        stencil: false,
        depth: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9 // Slightly increased from 0.7 for better visibility
      }}
      camera={{ position: [0, 0, 35], fov: 40 }}
    >
      <color attach="background" args={['#000201']} />
      
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={15}
        maxDistance={60}
        autoRotate={treeState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.3}
        target={[0, 0, 0]}
      />

      {/* Slightly increased ambient light to prevent total darkness in shadows */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 10]} intensity={0.5} color="#fffcf0" />
      <spotLight 
        position={[-10, 20, -5]} 
        angle={0.5} 
        penumbra={1} 
        intensity={1} 
        color={COLORS.gold} 
      />
      <spotLight position={[0, 5, -20]} intensity={1.5} color={COLORS.emerald} />

      <Suspense fallback={null}>
        <Environment preset="city" blur={1} />
      </Suspense>

      <TreeGroup treeState={treeState} />

      <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      <Suspense fallback={null}>
        <EffectComposer enableNormalPass={false} multisampling={0}>
            <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={1.0} 
                radius={0.6}
            />
            <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};

export default Experience;