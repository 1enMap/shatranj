import React, { useState } from 'react';
import { Activity, Cpu, Loader } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { calculateMaterialBalance, analyzePositionType } from '../utils/analysisUtils';
import { useStockfish } from '../hooks/useStockfish';

export function AnalysisPanel() {
  const { board, currentTurn, moveHistory } = useGameStore();
  const { isReady, isThinking, getBestMove, setDifficulty } = useStockfish();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!isReady || isThinking) return;

    try {
      setIsAnalyzing(true);
      setAnalysis(null);
      
      // Set engine difficulty to maximum for analysis
      setDifficulty(20);
      
      // Get the best move from the engine
      const bestMove = await getBestMove({
        board,
        currentTurn,
        moveHistory,
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        castlingRights: {
          whiteKingside: true,
          whiteQueenside: true,
          blackKingside: true,
          blackQueenside: true
        }
      });

      // Convert engine move to readable format
      const from = `${String.fromCharCode(97 + bestMove.from.file)}${8 - bestMove.from.rank}`;
      const to = `${String.fromCharCode(97 + bestMove.to.file)}${8 - bestMove.to.rank}`;
      
      setAnalysis(`Best move: ${from} to ${to}`);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysis('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white space-y-6">
      {/* Position Analysis */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-green-400" />
          <h2 className="font-medium">Position Analysis</h2>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Material Balance</span>
            <span className="font-mono">{calculateMaterialBalance(board)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Position Type</span>
            <span>{analyzePositionType(board)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Current Turn</span>
            <span className="capitalize">{currentTurn}</span>
          </div>
        </div>
      </div>

      {/* Engine Analysis */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Cpu className="h-5 w-5 text-blue-400" />
          <h2 className="font-medium">Engine Analysis</h2>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
          <button 
            onClick={handleAnalysis}
            disabled={!isReady || isThinking || isAnalyzing}
            className={`
              w-full py-2 px-4 rounded-lg transition-colors
              flex items-center justify-center space-x-2
              ${isReady && !isThinking && !isAnalyzing
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 cursor-not-allowed'
              }
            `}
          >
            {isAnalyzing || isThinking ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" />
                <span>Start Analysis</span>
              </>
            )}
          </button>

          {analysis && (
            <div className="text-sm bg-gray-800 rounded p-3 border border-gray-700">
              {analysis}
            </div>
          )}

          {!isReady && (
            <div className="text-sm text-yellow-400">
              Engine is initializing...
            </div>
          )}
        </div>
      </div>

      {/* Move History */}
      <div>
        <h2 className="font-medium mb-4">Move History</h2>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="max-h-48 overflow-y-auto space-y-1">
            {moveHistory.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No moves yet</p>
            ) : (
              moveHistory.map((move, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="w-8 text-gray-400">{Math.floor(index / 2) + 1}.</span>
                  <span>{move}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}