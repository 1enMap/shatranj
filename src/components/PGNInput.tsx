import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { parsePGN } from '../utils/pgnParser';

export function PGNInput() {
  const [pgnText, setPgnText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loadPGN = useGameStore(state => state.loadPGN);
  const resetGame = useGameStore(state => state.resetGame);
  const isAnimating = useGameStore(state => state.isAnimating);

  const handleLoadPGN = () => {
    if (isAnimating) return; // Prevent loading new PGN while animating
    
    try {
      setError(null);
      const game = parsePGN(pgnText);
      resetGame();
      loadPGN(game);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse PGN');
      console.error('Failed to load PGN:', err);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Load PGN
        </h2>
      </div>
      <textarea
        className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg 
                   text-white placeholder-gray-400 font-mono text-sm resize-none
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all duration-200"
        value={pgnText}
        onChange={(e) => setPgnText(e.target.value)}
        placeholder="Paste PGN notation here..."
        disabled={isAnimating}
      />
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 bg-red-900/20 p-2 rounded">
          <X className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleLoadPGN}
          disabled={isAnimating}
          className={`
            px-4 py-2 bg-blue-600 text-white rounded-lg
            transition-colors duration-200 flex items-center gap-2
            ${isAnimating 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-blue-700'
            }
          `}
        >
          <Upload className="h-4 w-4" />
          {isAnimating ? 'Loading...' : 'Load Game'}
        </button>
        <button
          onClick={() => setPgnText('')}
          disabled={isAnimating}
          className={`
            px-4 py-2 bg-gray-700 text-white rounded-lg
            transition-colors duration-200
            ${isAnimating 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-600'
            }
          `}
        >
          Clear
        </button>
      </div>
      <div className="mt-4 bg-gray-700/50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-300 mb-2">Example Format:</p>
        <pre className="text-xs text-gray-400 font-mono">
{`[Event "World Championship Match"]
[Site "London, England"]
[Date "2024.03.14"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "*"]

1. e2 to e4 e7 to e5
2. g1 to f3 b8 to c6`}
        </pre>
      </div>
    </div>
  );
}