import { ChessPiece, Position } from '../types/chess';

interface ParsedMove {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capture?: Position;
  promotion?: ChessPiece['type'];
}

export function parseMoveNotation(
  moveNotation: string,
  board: (ChessPiece | null)[][],
  currentTurn: 'white' | 'black'
): ParsedMove {
  try {
    // Parse standard move notation (e.g., "e2 to e4")
    const [fromSquare, , toSquare] = moveNotation.split(' ');
    
    if (!fromSquare || !toSquare) {
      throw new Error('Invalid move notation format');
    }

    // Convert algebraic notation to array indices
    const from: Position = {
      file: fromSquare.charCodeAt(0) - 97, // 'a' = 0, 'b' = 1, etc.
      rank: 8 - parseInt(fromSquare[1])    // '1' = 7, '2' = 6, etc.
    };

    const to: Position = {
      file: toSquare.charCodeAt(0) - 97,
      rank: 8 - parseInt(toSquare[1])
    };

    // Validate positions
    if (!isValidPosition(from) || !isValidPosition(to)) {
      throw new Error('Invalid square position');
    }

    // Get the piece at the starting position
    const piece = board[from.rank][from.file];
    if (!piece) {
      throw new Error(`No piece found at ${fromSquare}`);
    }

    // Verify piece color matches current turn
    if (piece.color !== currentTurn) {
      throw new Error(`Wrong color piece at ${fromSquare}`);
    }

    // Check for capture
    const capture = board[to.rank][to.file] ? to : undefined;

    // Check for pawn promotion
    let promotion: ChessPiece['type'] | undefined;
    if (moveNotation.includes('=')) {
      const promotionMatch = moveNotation.match(/=([QRBN])/i);
      if (promotionMatch) {
        const promotionPiece = promotionMatch[1].toLowerCase();
        switch (promotionPiece) {
          case 'q': promotion = 'queen'; break;
          case 'r': promotion = 'rook'; break;
          case 'b': promotion = 'bishop'; break;
          case 'n': promotion = 'knight'; break;
        }
      }
    }

    return { from, to, piece, capture, promotion };
  } catch (error) {
    console.error('Move parsing error:', error);
    throw new Error(`Invalid move notation: ${moveNotation}`);
  }
}

export function applyMove(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  promotion?: ChessPiece['type']
): (ChessPiece | null)[][] {
  // Create a new board to maintain immutability
  const newBoard = board.map(rank => [...rank]);
  const piece = newBoard[from.rank][from.file];
  
  if (!piece) {
    throw new Error('No piece found at source position');
  }

  // Handle pawn promotion
  if (promotion && piece.type === 'pawn' && (to.rank === 0 || to.rank === 7)) {
    newBoard[to.rank][to.file] = { ...piece, type: promotion };
  } else {
    newBoard[to.rank][to.file] = { ...piece };
  }
  
  // Clear the source square
  newBoard[from.rank][from.file] = null;
  
  return newBoard;
}

function isValidPosition(pos: Position): boolean {
  return pos.rank >= 0 && pos.rank < 8 && pos.file >= 0 && pos.file < 8;
}