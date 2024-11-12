import { ChessPiece } from '../types/chess';

export function boardToFEN(board: (ChessPiece | null)[][]): string {
  let fen = '';
  let emptySquares = 0;

  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece === null) {
        emptySquares++;
      } else {
        if (emptySquares > 0) {
          fen += emptySquares;
          emptySquares = 0;
        }
        const pieceSymbol = getPieceSymbol(piece);
        fen += piece.color === 'white' ? pieceSymbol.toUpperCase() : pieceSymbol.toLowerCase();
      }
    }
    if (emptySquares > 0) {
      fen += emptySquares;
      emptySquares = 0;
    }
    if (rank > 0) {
      fen += '/';
    }
  }

  return fen;
}

function getPieceSymbol(piece: ChessPiece): string {
  switch (piece.type) {
    case 'pawn': return 'p';
    case 'knight': return 'n';
    case 'bishop': return 'b';
    case 'rook': return 'r';
    case 'queen': return 'q';
    case 'king': return 'k';
    default: return '';
  }
}

export function analyzePositionType(board: (ChessPiece | null)[][]): string {
  const pieces = countPieces(board);
  
  if (isEndgame(pieces)) {
    return 'Endgame';
  } else if (isMiddlegame(pieces)) {
    return 'Middlegame';
  }
  return 'Opening';
}

interface PieceCount {
  whitePawns: number;
  blackPawns: number;
  whitePieces: number;
  blackPieces: number;
  totalPieces: number;
}

function countPieces(board: (ChessPiece | null)[][]): PieceCount {
  const count: PieceCount = {
    whitePawns: 0,
    blackPawns: 0,
    whitePieces: 0,
    blackPieces: 0,
    totalPieces: 0
  };

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece) {
        if (piece.type === 'pawn') {
          piece.color === 'white' ? count.whitePawns++ : count.blackPawns++;
        } else {
          piece.color === 'white' ? count.whitePieces++ : count.blackPieces++;
        }
        count.totalPieces++;
      }
    }
  }

  return count;
}

function isEndgame(pieces: PieceCount): boolean {
  return pieces.totalPieces <= 12 || 
         (pieces.whitePawns + pieces.blackPawns <= 6 && pieces.whitePieces + pieces.blackPieces <= 6);
}

function isMiddlegame(pieces: PieceCount): boolean {
  return pieces.totalPieces <= 24 && pieces.totalPieces > 12;
}

export function calculateMaterialBalance(board: (ChessPiece | null)[][]): number {
  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0
  };

  let balance = 0;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece) {
        const value = pieceValues[piece.type];
        balance += piece.color === 'white' ? value : -value;
      }
    }
  }

  return balance;
}

export function getMaterialCount(board: (ChessPiece | null)[][]): { white: number; black: number } {
  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0
  };

  const count = {
    white: 0,
    black: 0
  };

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece) {
        const value = pieceValues[piece.type];
        if (piece.color === 'white') {
          count.white += value;
        } else {
          count.black += value;
        }
      }
    }
  }

  return count;
}