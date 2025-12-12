import React, { useState } from 'react';
import Experience from './components/Experience.tsx';
import Overlay from './components/Overlay.tsx';
import { TreeMorphState } from './types.ts';

// Simple Loader Component
const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-emerald-900 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
      <div className="text-yellow-500 font-serif tracking-widest text-sm uppercase">Loading Experience</div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeMorphState.TREE_SHAPE 
        ? TreeMorphState.SCATTERED 
        : TreeMorphState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
         <Experience treeState={treeState} />
      </div>

      {/* UI Overlay Layer */}
      <Overlay treeState={treeState} toggleState={toggleState} />
    </div>
  );
};

export default App;