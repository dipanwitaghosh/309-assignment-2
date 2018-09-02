const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const RPS = require('./rock-paper-scissors');

const app = express();

const clientPath = `${__dirname}/public/`;
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);

let waitingPlayer = null;

io.on('connection', (sock) => {

  if (waitingPlayer) {
    new RPS(waitingPlayer, sock);
    waitingPlayer = null;
  } else {
    waitingPlayer = sock;
    waitingPlayer.emit('message', 'Waiting for an opponent');
  }

  sock.on('message', (text) => {
    io.emit('message', text);
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

const port = process.env.PORT || 8080;
const IP = process.env.IP || "localhost"

server.listen(port, IP, () => {
  console.log('Server started on ' + IP + ":" + port);
});