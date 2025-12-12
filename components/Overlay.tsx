import React from 'react';
import { TreeMorphState } from '../types.ts';

interface OverlayProps {
  treeState: TreeMorphState;
  toggleState: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ treeState, toggleState }) => {
  const isTree = treeState === TreeMorphState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-tighter leading-tight">
            Merry<br className="md:hidden" /> Christmas
          </h1>
          <h2 className="text-lg text-emerald-100/80 tracking-[0.2em] uppercase mt-2 border-l-2 border-yellow-500 pl-4">
            Season's Greetings
          </h2>
        </div>
        <div className="hidden md:block text-right text-xs text-emerald-500/50 uppercase tracking-widest font-mono">
          Interactive WebGL<br />
          Experience v1.0
        </div>
      </div>

      {/* Footer Controls - Moved to bottom right to clear center view */}
      <div className="flex justify-end items-end w-full">
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <p className="text-emerald-500/40 text-xs tracking-widest font-mono text-right mb-2">
            {isTree ? "STATUS: CONVERGED" : "STATUS: ETHEREAL SCATTER"}
          </p>
          
          <button
            onClick={toggleState}
            className={`
              relative group px-8 py-4 overflow-hidden rounded-full transition-all duration-500
              ${isTree 
                ? 'bg-emerald-900/40 border border-emerald-500/30 text-emerald-100' 
                : 'bg-yellow-600/20 border border-yellow-400/50 text-yellow-100'
              }
              backdrop-blur-md hover:scale-105 active:scale-95 shadow-lg
            `}
          >
            <span className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer`} />
            <span className="relative font-serif text-xl tracking-widest uppercase">
              {isTree ? "Release Magic" : "Assemble Form"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overlay;