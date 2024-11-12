import { useEffect, useState } from 'react';
import { wrap } from 'comlink';
import type { Remote } from 'comlink';

type StockfishAPI = {
  init: () => Promise<boolean>;
  analyze: (fen: string, depth?: number) => Promise<string | null>;
  quit: () => Promise<void>;
};

export function useStockfish() {
  const [engine, setEngine] = useState<Remote<StockfishAPI> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  useEffect(() => {
    const initEngine = async () => {
      try {
        const worker = new Worker(
          new URL('../workers/stockfish.worker.ts', import.meta.url),
          { type: 'module' }
        );
        const stockfish = wrap<StockfishAPI>(worker);
        const initialized = await stockfish.init();
        
        if (initialized) {
          setEngine(stockfish);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
      }
    };

    initEngine();

    return () => {
      if (engine) {
        engine.quit();
      }
    };
  }, []);

  const analyzePosition = async (fen: string, depth: number = 15) => {
    if (!engine || !isInitialized) return;

    try {
      setIsAnalyzing(true);
      const bestMove = await engine.analyze(fen, depth);
      setCurrentAnalysis(bestMove);
      setIsAnalyzing(false);
      return bestMove;
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
    }
  };

  return {
    isInitialized,
    isAnalyzing,
    currentAnalysis,
    analyzePosition
  };
};