import React from 'react';
import { ChessPiece, PieceColor } from '../types/chess';

interface PawnPromotionModalProps {
  color: PieceColor;
  onSelect: (pieceType: ChessPiece['type']) => void;
}

export function PawnPromotionModal({ color, onSelect }: PawnPromotionModalProps) {
  const pieces: ChessPiece['type'][] = ['queen', 'rook', 'bishop', 'knight'];
  const symbols: Record<string, string> = {
    'white-queen': '♕', 'white-rook': '♖', 'white-bishop': '♗', 'white-knight': '♘',
    'black-queen': '♛', 'black-rook': '♜', 'black-bishop': '♝', 'black-knight': '♞'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
        <h3 className="text-white text-lg font-semibold mb-4">Promote Pawn to:</h3>
        <div className="grid grid-cols-4 gap-2">
          {pieces.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="w-16 h-16 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <span className={`text-4xl ${color === 'white' ? 'text-white' : 'text-gray-900'}`}>
                {symbols[`${color}-${pieceType}`]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}