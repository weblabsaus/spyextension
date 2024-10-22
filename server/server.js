// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let currentCommand = '';  // Store the current command

// Serve static files for the web interface
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get the current command
app.get('/api/command', (req, res) => {
  res.json({ command: currentCommand });
});

// API to receive the ping results
app.post('/api/ping-results', express.json(), (req, res) => {
  const { ip, result } = req.body;
  const log = `IP: ${ip} Result: ${result}\n`;
  fs.appendFileSync('ping_results.txt', log);
  res.status(200).send('Ping result received');
});

// Listen for commands from the web interface
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('send-command', (command) => {
    console.log('Received command:', command);
    currentCommand = command;  // Update the current command
    io.emit('new-command', command);  // Broadcast to all extensions
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
