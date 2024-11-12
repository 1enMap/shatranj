import React, { useEffect } from 'react';
import { Clock, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../utils/timeFormat';

export function GameInfo() {
  const { 
    currentTurn, 
    moveHistory, 
    capturedPieces,
    timer,
    isTimerRunning,
    updateTimer,
    startTimer
  } = useGameStore();

  // Start timer automatically when component mounts
  useEffect(() => {
    if (!isTimerRunning) {
      startTimer();
    }
  }, []);

  // Update timer every second
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, updateTimer]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      <div className="space-y-6">
        {/* Player Timers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">White</div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-lg font-mono">{formatTime(timer.white)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Black</div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-lg font-mono">{formatTime(timer.black)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 my-4"></div>

        {/* Game Stats */}
        <div className="bg-gray-700 rounded p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Game Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Current Turn</div>
            <div className="text-right capitalize">{currentTurn}</div>
            <div className="text-gray-400">Total Moves</div>
            <div className="text-right">{moveHistory.length}</div>
            <div className="text-gray-400">Captured Pieces</div>
            <div className="text-right">{capturedPieces.length}</div>
          </div>
        </div>

        {/* Move History */}
        <div className="bg-gray-700 rounded p-4">
          <div className="text-sm font-medium mb-2">Move History</div>
          <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {moveHistory.length === 0 ? (
              <div className="text-xs text-gray-400 italic">No moves yet</div>
            ) : (
              moveHistory.map((move, index) => (
                <div key={index} className="text-xs">
                  <span className="text-gray-400">{Math.floor(index / 2) + 1}.</span>
                  <span className="ml-1 text-white">{move}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Captured Pieces */}
        <div className="bg-gray-700 rounded p-4">
          <div className="text-sm font-medium mb-2">Captured Pieces</div>
          <div className="flex flex-wrap gap-2">
            {capturedPieces.map((piece, index) => (
              <div 
                key={index}
                className={`text-2xl ${
                  piece.color === 'white' 
                    ? 'text-white' 
                    : 'text-gray-900'
                }`}
              >
                {getPieceSymbol(piece)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPieceSymbol(piece: { type: string; color: string }) {
  const symbols: Record<string, string> = {
    'white-king': '♔', 'white-queen': '♕', 'white-rook': '♖',
    'white-bishop': '♗', 'white-knight': '♘', 'white-pawn': '♙',
    'black-king': '♚', 'black-queen': '♛', 'black-rook': '♜',
    'black-bishop': '♝', 'black-knight': '♞', 'black-pawn': '♟'
  };
  return symbols[`${piece.color}-${piece.type}`] || '';
}