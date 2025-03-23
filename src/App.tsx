import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppContent from './AppContent';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from "@vercel/analytics/react";
import './styles/ocrUploader.css';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker using local worker file
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Using the ES module worker from the local package
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
}

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