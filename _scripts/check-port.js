#!/usr/bin/env node

const net = require('net');
const port = parseInt(process.argv[2] || '8080');

const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('in-use');
    process.exit(0);
  } else {
    console.log('error');
    process.exit(1);
  }
});

server.once('listening', () => {
  server.close();
  console.log('free');
  process.exit(0);
});

server.listen(port, '127.0.0.1');
