import React from 'react';
import { Layout } from './components/Layout';
import { ChessBoard } from './components/ChessBoard';
import { AnalysisPanel } from './components/AnalysisPanel';
import { PGNInput } from './components/PGNInput';

function App() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChessBoard />
            <PGNInput />
          </div>
          <div>
            <AnalysisPanel />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;