import React from 'react';
import { Crown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Layout({ children }: { children: React.ReactNode }) {
  const resetGame = useGameStore(state => state.resetGame);

  const handleNewGame = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="border-b border-gray-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">ChessMaster</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleNewGame}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                New Game
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}