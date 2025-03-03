/**
 * Debug script for the backend server
 * Run with: node debug.js
 */

// Check Node.js version
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);

// Check if required modules are available
try {
  require('express');
  console.log('✅ Express module is available');
} catch (error) {
  console.error('❌ Express module is not available:', error.message);
}

try {
  require('pdfkit');
  console.log('✅ PDFKit module is available');
} catch (error) {
  console.error('❌ PDFKit module is not available:', error.message);
}

try {
  require('cors');
  console.log('✅ CORS module is available');
} catch (error) {
  console.error('❌ CORS module is not available:', error.message);
}

try {
  require('body-parser');
  console.log('✅ body-parser module is available');
} catch (error) {
  console.error('❌ body-parser module is not available:', error.message);
}

// Check if port is available
const net = require('net');
const server = net.createServer();
const port = process.env.PORT || 5000;

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  } else {
    console.error('❌ Error checking port availability:', err.message);
  }
  server.close();
});

server.once('listening', () => {
  console.log(`✅ Port ${port} is available`);
  server.close();
});

server.listen(port);

console.log('\nIf all checks pass, try running the server with:');
console.log('node server.js');
console.log('\nFor more detailed logs, run with:');
console.log('DEBUG=express:* node server.js'); 