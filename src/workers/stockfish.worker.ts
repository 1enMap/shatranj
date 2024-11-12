import { expose } from 'comlink';

let stockfish: Worker | null = null;
let isReady = false;

const stockfishAPI = {
  async init() {
    try {
      stockfish = new Worker(new URL('./stockfish.js', import.meta.url), {
        type: 'module'
      });
      
      return new Promise((resolve) => {
        if (!stockfish) return resolve(false);
        
        stockfish.onmessage = (e) => {
          if (e.data === 'uciok') {
            isReady = true;
            resolve(true);
          }
        };
        
        stockfish.postMessage('uci');
      });
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
      return false;
    }
  },

  async analyze(fen: string, depth: number = 15) {
    if (!stockfish || !isReady) return null;

    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        const data = e.data as string;
        if (data.includes('bestmove')) {
          stockfish?.removeEventListener('message', handler);
          const match = data.match(/bestmove\s+(\S+)/);
          resolve(match ? match[1] : null);
        }
      };

      stockfish.addEventListener('message', handler);
      stockfish.postMessage(`position fen ${fen}`);
      stockfish.postMessage(`go depth ${depth}`);
    });
  },

  async quit() {
    if (stockfish) {
      stockfish.postMessage('quit');
      stockfish.terminate();
      stockfish = null;
      isReady = false;
    }
  }
};

expose(stockfishAPI);