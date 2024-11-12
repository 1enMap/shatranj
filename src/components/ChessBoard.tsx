import React, { useEffect, useRef } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import { Position } from '../types/chess';
import { PawnPromotionModal } from './PawnPromotionModal';
import { useGameStore } from '../store/gameStore';

export function ChessBoard() {
  const { gameState, selectPiece, movePiece, handlePromotion } = useChessGame();
  const isAnimating = useGameStore(state => state.isAnimating);
  const boardRef = useRef<HTMLDivElement>(null);
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const handleSquareClick = (position: Position) => {
    if (isAnimating) return;
    
    if (gameState.selectedPiece) {
      if (gameState.validMoves.some(move => 
        move.rank === position.rank && move.file === position.file
      )) {
        movePiece(position);
      } else {
        selectPiece(position);
      }
    } else {
      selectPiece(position);
    }
  };

  useEffect(() => {
    if (isAnimating && boardRef.current) {
      boardRef.current.classList.add('pointer-events-none');
    } else if (boardRef.current) {
      boardRef.current.classList.remove('pointer-events-none');
    }
  }, [isAnimating]);

  const getPieceSymbol = (position: Position) => {
    const piece = gameState.board[position.rank][position.file];
    if (!piece) return null;

    const symbols: Record<string, string> = {
      'white-king': '♔', 'white-queen': '♕', 'white-rook': '♖',
      'white-bishop': '♗', 'white-knight': '♘', 'white-pawn': '♙',
      'black-king': '♚', 'black-queen': '♛', 'black-rook': '♜',
      'black-bishop': '♝', 'black-knight': '♞', 'black-pawn': '♟'
    };

    return (
      <span 
        className={`
          text-5xl select-none
          ${piece.color === 'white' 
            ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' 
            : 'text-gray-900 drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]'}
          transition-transform duration-300 ease-in-out
          ${isAnimating ? 'scale-110' : 'scale-100'}
        `}
      >
        {symbols[`${piece.color}-${piece.type}`]}
      </span>
    );
  };

  return (
    <>
      <div className="aspect-square max-w-2xl mx-auto" ref={boardRef}>
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 border-2 border-gray-700 rounded-lg overflow-hidden shadow-xl">
          {ranks.map((rank, rankIndex) =>
            files.map((file, fileIndex) => {
              const position: Position = { rank: rankIndex, file: fileIndex };
              const isLight = (rankIndex + fileIndex) % 2 === 0;
              const isSelected = gameState.selectedPiece?.rank === rankIndex && 
                               gameState.selectedPiece?.file === fileIndex;
              const isValidMove = gameState.validMoves.some(move => 
                move.rank === rankIndex && move.file === fileIndex
              );

              return (
                <div
                  key={`${file}${rank}`}
                  className={`
                    relative cursor-pointer flex items-center justify-center
                    transition-colors duration-300 ease-in-out
                    ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                    ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
                    ${isValidMove ? 'ring-4 ring-green-500 ring-inset' : ''}
                    hover:brightness-110
                  `}
                  onClick={() => handleSquareClick(position)}
                >
                  {getPieceSymbol(position)}
                  {rankIndex === 7 && (
                    <span className="absolute bottom-0.5 right-1 text-xs font-semibold opacity-50">
                      {file}
                    </span>
                  )}
                  {fileIndex === 0 && (
                    <span className="absolute top-0.5 left-1 text-xs font-semibold opacity-50">
                      {rank}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {gameState.pendingPromotion && (
        <PawnPromotionModal
          color={gameState.currentTurn === 'white' ? 'black' : 'white'}
          onSelect={handlePromotion}
        />
      )}
    </>
  );
}