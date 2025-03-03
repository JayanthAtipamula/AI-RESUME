import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppContent from './AppContent';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppContent />
        <Analytics />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;