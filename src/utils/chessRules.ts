import { ChessPiece, PieceColor, Position, GameState } from '../types/chess';

function isValidPosition(pos: Position): boolean {
  return pos.rank >= 0 && pos.rank < 8 && pos.file >= 0 && pos.file < 8;
}

export function getPieceMoves(pos: Position, piece: ChessPiece, gameState: GameState): Position[] {
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(pos, piece.color, gameState);
    case 'rook':
      return getRookMoves(pos, piece.color, gameState);
    case 'knight':
      return getKnightMoves(pos, piece.color, gameState);
    case 'bishop':
      return getBishopMoves(pos, piece.color, gameState);
    case 'queen':
      return getQueenMoves(pos, piece.color, gameState);
    case 'king':
      return getKingMoves(pos, piece.color, gameState);
    default:
      return [];
  }
}

function getPawnMoves(pos: Position, color: PieceColor, gameState: GameState): Position[] {
  const moves: Position[] = [];
  const direction = color === 'white' ? -1 : 1;
  const startRank = color === 'white' ? 6 : 1;

  // Forward move
  const oneStep = { rank: pos.rank + direction, file: pos.file };
  if (isValidPosition(oneStep) && !gameState.board[oneStep.rank][oneStep.file]) {
    moves.push(oneStep);

    // Two steps forward from starting position
    if (pos.rank === startRank) {
      const twoStep = { rank: pos.rank + (2 * direction), file: pos.file };
      if (!gameState.board[twoStep.rank][twoStep.file]) {
        moves.push(twoStep);
      }
    }
  }

  // Captures (including en passant)
  const captures = [
    { rank: pos.rank + direction, file: pos.file - 1 },
    { rank: pos.rank + direction, file: pos.file + 1 }
  ];

  for (const capture of captures) {
    if (isValidPosition(capture)) {
      const targetPiece = gameState.board[capture.rank][capture.file];
      if (targetPiece && targetPiece.color !== color) {
        moves.push(capture);
      }
      // En passant
      if (gameState.enPassantTarget &&
          capture.rank === gameState.enPassantTarget.rank &&
          capture.file === gameState.enPassantTarget.file) {
        moves.push(capture);
      }
    }
  }

  return moves;
}

function getRookMoves(pos: Position, color: PieceColor, gameState: GameState): Position[] {
  const moves: Position[] = [];
  const directions = [
    { rank: -1, file: 0 }, // up
    { rank: 1, file: 0 },  // down
    { rank: 0, file: -1 }, // left
    { rank: 0, file: 1 }   // right
  ];

  for (const dir of directions) {
    let current = { rank: pos.rank + dir.rank, file: pos.file + dir.file };
    while (isValidPosition(current)) {
      const targetPiece = gameState.board[current.rank][current.file];
      if (!targetPiece) {
        moves.push({ ...current });
      } else {
        if (targetPiece.color !== color) {
          moves.push({ ...current });
        }
        break;
      }
      current.rank += dir.rank;
      current.file += dir.file;
    }
  }

  return moves;
}

function getKnightMoves(pos: Position, color: PieceColor, gameState: GameState): Position[] {
  const moves: Position[] = [];
  const offsets = [
    { rank: -2, file: -1 }, { rank: -2, file: 1 },
    { rank: -1, file: -2 }, { rank: -1, file: 2 },
    { rank: 1, file: -2 }, { rank: 1, file: 2 },
    { rank: 2, file: -1 }, { rank: 2, file: 1 }
  ];

  for (const offset of offsets) {
    const target = {
      rank: pos.rank + offset.rank,
      file: pos.file + offset.file
    };

    if (isValidPosition(target)) {
      const targetPiece = gameState.board[target.rank][target.file];
      if (!targetPiece || targetPiece.color !== color) {
        moves.push(target);
      }
    }
  }

  return moves;
}

function getBishopMoves(pos: Position, color: PieceColor, gameState: GameState): Position[] {
  const moves: Position[] = [];
  const directions = [
    { rank: -1, file: -1 }, // up-left
    { rank: -1, file: 1 },  // up-right
    { rank: 1, file: -1 },  // down-left
    { rank: 1, file: 1 }    // down-right
  ];

  for (const dir of directions) {
    let current = { rank: pos.rank + dir.rank, file: pos.file + dir.file };
    while (isValidPosition(current)) {
      const targetPiece = gameState.board[current.rank][current.file];
      if (!targetPiece) {
        moves.push({ ...current });
      } else {
        if (targetPiece.color !== color) {
          moves.push({ ...current });
        }
        break;
      }
      current.rank += dir.rank;
      current.file += dir.file;
    }
  }

  return moves;
}

function getQueenMoves(pos: Position, color: PieceColor, gameState: GameState): Position[] {
  return [
    ...getRookMoves(pos, color, gameState),
    ...getBishopMoves(pos, color, gameState)
  ];
}

function getKingMoves(pos: Position, color: PieceColor, gameState: GameState): Position[] {
  const moves: Position[] = [];
  const directions = [
    { rank: -1, file: -1 }, { rank: -1, file: 0 }, { rank: -1, file: 1 },
    { rank: 0, file: -1 },                          { rank: 0, file: 1 },
    { rank: 1, file: -1 },  { rank: 1, file: 0 },  { rank: 1, file: 1 }
  ];

  for (const dir of directions) {
    const target = {
      rank: pos.rank + dir.rank,
      file: pos.file + dir.file
    };

    if (isValidPosition(target)) {
      const targetPiece = gameState.board[target.rank][target.file];
      if (!targetPiece || targetPiece.color !== color) {
        moves.push(target);
      }
    }
  }

  // TODO: Add castling moves when implementing that feature
  return moves;
}

export function isInCheck(color: PieceColor, gameState: GameState): boolean {
  let kingPos: Position | null = null;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = gameState.board[rank][file];
      if (piece?.type === 'king' && piece.color === color) {
        kingPos = { rank, file };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = gameState.board[rank][file];
      if (piece && piece.color !== color) {
        const moves = getPieceMoves({ rank, file }, piece, gameState);
        if (moves.some(move => move.rank === kingPos!.rank && move.file === kingPos!.file)) {
          return true;
        }
      }
    }
  }

  return false;
}

function wouldMoveResultInCheck(from: Position, to: Position, color: PieceColor, gameState: GameState): boolean {
  const newBoard = gameState.board.map(rank => [...rank]);
  const piece = newBoard[from.rank][from.file];
  
  newBoard[to.rank][to.file] = piece;
  newBoard[from.rank][from.file] = null;
  
  const newGameState = { ...gameState, board: newBoard };
  return isInCheck(color, newGameState);
}

export function getLegalMoves(pos: Position, piece: ChessPiece, gameState: GameState): Position[] {
  const possibleMoves = getPieceMoves(pos, piece, gameState);
  
  return possibleMoves.filter(move => 
    !wouldMoveResultInCheck(pos, move, piece.color, gameState)
  );
}

export function hasLegalMoves(color: PieceColor, gameState: GameState): boolean {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = gameState.board[rank][file];
      if (piece && piece.color === color) {
        const legalMoves = getLegalMoves({ rank, file }, piece, gameState);
        if (legalMoves.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isCheckmate(color: PieceColor, gameState: GameState): boolean {
  return isInCheck(color, gameState) && !hasLegalMoves(color, gameState);
}

export function isStalemate(color: PieceColor, gameState: GameState): boolean {
  return !isInCheck(color, gameState) && !hasLegalMoves(color, gameState);
}