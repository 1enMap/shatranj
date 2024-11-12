import React from 'react';
import { RotateCcw, FastForward, Rewind, Play, Pause, Cpu } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useChessGame } from '../hooks/useChessGame';

export function GameControls() {
  const { resetGame, isTimerRunning, startTimer, pauseTimer } = useGameStore();
  const { toggleEngine, isEnginePlaying } = useChessGame();

  const handleResetGame = () => {
    resetGame();
    pauseTimer();
  };

  const handlePlayPause = () => {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div className="mt-4 flex justify-center space-x-4">
      <button 
        onClick={handleResetGame}
        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
        title="Reset Game"
      >
        <RotateCcw className="h-6 w-6" />
      </button>
      <button 
        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
        title="Previous Move"
      >
        <Rewind className="h-6 w-6" />
      </button>
      <button 
        onClick={handlePlayPause}
        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
        title="Play/Pause"
      >
        {isTimerRunning ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </button>
      <button 
        className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
        title="Next Move"
      >
        <FastForward className="h-6 w-6" />
      </button>
      <button 
        onClick={toggleEngine}
        className={`p-2 rounded-full transition-colors ${
          isEnginePlaying 
            ? 'text-green-400 hover:text-green-300 hover:bg-gray-700' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
        title="Play Against Engine"
      >
        <Cpu className="h-6 w-6" />
      </button>
    </div>
  );
}