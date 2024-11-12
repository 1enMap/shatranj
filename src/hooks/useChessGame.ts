import { useState, useCallback, useEffect } from 'react';
import { ChessPiece, Position, GameState } from '../types/chess';
import { createInitialBoard } from '../utils/chessLogic';
import { getLegalMoves, isInCheck, isCheckmate, isStalemate } from '../utils/chessRules';
import { useStockfish } from './useStockfish';

const initialGameState: GameState = {
  board: createInitialBoard(),
  currentTurn: 'white',
  selectedPiece: null,
  validMoves: [],
  capturedPieces: [],
  moveHistory: [],
  enPassantTarget: null,
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  drawOffered: false,
  pendingPromotion: null,
  castlingRights: {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true
  }
};

export function useChessGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isEnginePlaying, setIsEnginePlaying] = useState(false);
  const { isReady, isThinking, getBestMove } = useStockfish();

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setIsEnginePlaying(false);
  }, []);

  const selectPiece = useCallback((position: Position) => {
    const piece = gameState.board[position.rank][position.file];
    
    if (!piece || piece.color !== gameState.currentTurn || 
        (isEnginePlaying && gameState.currentTurn === 'black') ||
        gameState.pendingPromotion) {
      setGameState(prev => ({ ...prev, selectedPiece: null, validMoves: [] }));
      return;
    }

    const validMoves = getLegalMoves(position, piece, gameState);
    setGameState(prev => ({ ...prev, selectedPiece: position, validMoves }));
  }, [gameState, isEnginePlaying]);

  const movePiece = useCallback((to: Position) => {
    if (!gameState.selectedPiece) return;

    const from = gameState.selectedPiece;
    const piece = gameState.board[from.rank][from.file];
    if (!piece) return;

    // Check if the move is valid
    const validMoves = getLegalMoves(from, piece, gameState);
    if (!validMoves.some(move => move.rank === to.rank && move.file === to.file)) return;

    // Check for pawn promotion
    if (piece.type === 'pawn' && (to.rank === 0 || to.rank === 7)) {
      setGameState(prev => ({
        ...prev,
        pendingPromotion: { from, to }
      }));
      return;
    }

    executeMove(from, to);
  }, [gameState]);

  const executeMove = useCallback((from: Position, to: Position, promotionPiece?: ChessPiece['type']) => {
    const newBoard = gameState.board.map(rank => [...rank]);
    const piece = newBoard[from.rank][from.file];
    if (!piece) return;

    const movingPiece = promotionPiece 
      ? { ...piece, type: promotionPiece }
      : { ...piece, hasMoved: true };
    
    const capturedPiece = newBoard[to.rank][to.file];

    // Handle en passant capture
    let enPassantCapture = null;
    if (piece.type === 'pawn' && gameState.enPassantTarget &&
        to.rank === gameState.enPassantTarget.rank &&
        to.file === gameState.enPassantTarget.file) {
      enPassantCapture = newBoard[from.rank][to.file];
      newBoard[from.rank][to.file] = null;
    }

    // Set new en passant target if pawn moves two squares
    let newEnPassantTarget = null;
    if (piece.type === 'pawn' && Math.abs(to.rank - from.rank) === 2) {
      newEnPassantTarget = {
        rank: (from.rank + to.rank) / 2,
        file: from.file
      };
    }

    newBoard[to.rank][to.file] = movingPiece;
    newBoard[from.rank][from.file] = null;

    const newCapturedPieces = [...gameState.capturedPieces];
    if (capturedPiece) {
      newCapturedPieces.push(capturedPiece);
    } else if (enPassantCapture) {
      newCapturedPieces.push(enPassantCapture);
    }

    const moveNotation = `${String.fromCharCode(97 + from.file)}${8 - from.rank} to ${String.fromCharCode(97 + to.file)}${8 - to.rank}${promotionPiece ? ` (=${promotionPiece})` : ''}`;

    const nextTurn = gameState.currentTurn === 'white' ? 'black' : 'white';
    const newGameState: GameState = {
      ...gameState,
      board: newBoard,
      currentTurn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      capturedPieces: newCapturedPieces,
      moveHistory: [...gameState.moveHistory, moveNotation],
      enPassantTarget: newEnPassantTarget,
      pendingPromotion: null,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
    };

    // Check game state
    newGameState.isCheck = isInCheck(nextTurn, newGameState);
    newGameState.isCheckmate = isCheckmate(nextTurn, newGameState);
    newGameState.isStalemate = isStalemate(nextTurn, newGameState);

    setGameState(newGameState);
  }, [gameState]);

  const handlePromotion = useCallback((pieceType: ChessPiece['type']) => {
    if (!gameState.pendingPromotion) return;
    
    const { from, to } = gameState.pendingPromotion;
    executeMove(from, to, pieceType);
  }, [gameState, executeMove]);

  const toggleEngine = useCallback(() => {
    if (!isReady) return;
    setIsEnginePlaying(prev => !prev);
  }, [isReady]);

  // Engine move effect
  useEffect(() => {
    if (isEnginePlaying && isReady && gameState.currentTurn === 'black' && 
        !gameState.isCheckmate && !gameState.isStalemate && !gameState.pendingPromotion) {
      getBestMove(gameState).then(({ from, to }) => {
        selectPiece(from);
        setTimeout(() => movePiece(to), 300);
      });
    }
  }, [isEnginePlaying, isReady, gameState, getBestMove, selectPiece, movePiece]);

  return {
    gameState,
    selectPiece,
    movePiece,
    handlePromotion,
    resetGame,
    isEnginePlaying,
    toggleEngine,
    isThinking: isThinking && isEnginePlaying
  };
}