import { ChessPiece, Position } from '../types/chess';

export interface PGNGame {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  moves: string[];
}

export function parsePGN(pgnText: string): PGNGame {
  const game: PGNGame = { moves: [] };

  try {
    const lines = pgnText.trim().split('\n');
    let moveText = '';

    // Parse headers
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('[')) {
        const match = trimmedLine.match(/\[(\w+)\s+"([^"]+)"\]/);
        if (match) {
          const [, tag, value] = match;
          switch (tag.toLowerCase()) {
            case 'event': game.event = value; break;
            case 'site': game.site = value; break;
            case 'date': game.date = value; break;
            case 'round': game.round = value; break;
            case 'white': game.white = value; break;
            case 'black': game.black = value; break;
            case 'result': game.result = value; break;
          }
        }
      } else {
        moveText += ' ' + trimmedLine;
      }
    }

    // Parse moves
    const moveRegex = /\d+\.\s*([a-h][1-8]\s+to\s+[a-h][1-8])(?:\s+([a-h][1-8]\s+to\s+[a-h][1-8]))?/g;
    let match;

    while ((match = moveRegex.exec(moveText)) !== null) {
      if (match[1]) game.moves.push(match[1].trim());
      if (match[2]) game.moves.push(match[2].trim());
    }

    if (game.moves.length === 0) {
      throw new Error('No valid moves found in PGN');
    }

    return game;
  } catch (error) {
    console.error('PGN parsing error:', error);
    throw new Error('Invalid PGN format. Please check the example and try again.');
  }
}

export function moveToSquares(move: string): { from: Position; to: Position } {
  const [fromStr, , toStr] = move.split(' ');
  
  return {
    from: {
      file: fromStr.charCodeAt(0) - 97,
      rank: 8 - parseInt(fromStr[1])
    },
    to: {
      file: toStr.charCodeAt(0) - 97,
      rank: 8 - parseInt(toStr[1])
    }
  };
}