import { create } from 'zustand';
import { createInitialBoard } from '../utils/chessLogic';
import type { PGNGame } from '../utils/pgnParser';
import type { ChessPiece, Position } from '../types/chess';

interface Timer {
  white: number;
  black: number;
}

interface GameState {
  board: (ChessPiece | null)[][];
  currentTurn: 'white' | 'black';
  moveHistory: string[];
  capturedPieces: ChessPiece[];
  isAnalyzing: boolean;
  analysisDepth: number;
  selectedPiece: Position | null;
  validMoves: Position[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  pendingPromotion: { from: Position; to: Position } | null;
  isAnimating: boolean;
  timer: Timer;
  isTimerRunning: boolean;
}

interface GameStore extends GameState {
  setBoard: (board: (ChessPiece | null)[][]) => void;
  addMove: (move: string) => void;
  resetGame: () => void;
  loadPGN: (pgn: PGNGame) => void;
  startAnalysis: () => void;
  stopAnalysis: () => void;
  setIsAnimating: (isAnimating: boolean) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  updateTimer: () => void;
}

const INITIAL_TIME = 600; // 10 minutes in seconds

const initialState: GameState = {
  board: createInitialBoard(),
  currentTurn: 'white',
  moveHistory: [],
  capturedPieces: [],
  isAnalyzing: false,
  analysisDepth: 0,
  selectedPiece: null,
  validMoves: [],
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  pendingPromotion: null,
  isAnimating: false,
  timer: {
    white: INITIAL_TIME,
    black: INITIAL_TIME
  },
  isTimerRunning: false
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setBoard: (board) => set({ board }),

  addMove: (move) =>
    set((state) => ({
      moveHistory: [...state.moveHistory, move],
      currentTurn: state.currentTurn === 'white' ? 'black' : 'white',
    })),

  resetGame: () => set(initialState),

  setIsAnimating: (isAnimating) => set({ isAnimating }),

  loadPGN: async (pgn) => {
    set(initialState);
    set({ isAnimating: true });

    const moves = [...pgn.moves];
    let currentBoard = createInitialBoard();

    const playMove = async (moveNotation: string) => {
      const [fromSquare, , toSquare] = moveNotation.split(' ');
      
      const from: Position = {
        file: fromSquare.charCodeAt(0) - 97,
        rank: 8 - parseInt(fromSquare[1])
      };
      
      const to: Position = {
        file: toSquare.charCodeAt(0) - 97,
        rank: 8 - parseInt(toSquare[1])
      };

      const piece = currentBoard[from.rank][from.file];
      if (!piece) return;

      const newBoard = currentBoard.map(rank => [...rank]);
      const capturedPiece = newBoard[to.rank][to.file];
      
      newBoard[to.rank][to.file] = piece;
      newBoard[from.rank][from.file] = null;

      set((state) => ({
        board: newBoard,
        moveHistory: [...state.moveHistory, moveNotation],
        capturedPieces: capturedPiece 
          ? [...state.capturedPieces, capturedPiece]
          : state.capturedPieces,
        currentTurn: state.moveHistory.length % 2 === 0 ? 'black' : 'white'
      }));

      currentBoard = newBoard;
      await new Promise(resolve => setTimeout(resolve, 800));
    };

    for (const move of moves) {
      await playMove(move);
    }

    set({ isAnimating: false });
  },

  startAnalysis: () => set({ isAnalyzing: true }),
  
  stopAnalysis: () => set({ isAnalyzing: false }),

  startTimer: () => set({ isTimerRunning: true }),
  
  pauseTimer: () => set({ isTimerRunning: false }),
  
  updateTimer: () => set((state) => ({
    timer: {
      ...state.timer,
      [state.currentTurn]: Math.max(0, state.timer[state.currentTurn] - 1)
    }
  }))
}));