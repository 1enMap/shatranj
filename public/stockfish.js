// Download and include the Stockfish.js file in the public directory
importScripts('https://unpkg.com/stockfish.js@10.0.2/stockfish.js');

let stockfish;

self.onmessage = function(e) {
  if (!stockfish) {
    stockfish = new Worker(Stockfish());
    stockfish.onmessage = function(e) {
      self.postMessage(e.data);
    };
  }
  stockfish.postMessage(e.data);
};