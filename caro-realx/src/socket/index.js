const { Server } = require('socket.io');
const roomHandler = require('./roomHandler');
const chatHandler = require('./chatHandler');

// In-memory store
const rooms = new Map();    // roomId -> room object
const players = new Map();  // socketId -> player info

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Register player
    socket.on('register', (username) => {
      players.set(socket.id, { socketId: socket.id, username, roomId: null });
      socket.emit('registered', { socketId: socket.id, username });
      broadcastLobby(io, rooms);
    });

    roomHandler(io, socket, rooms, players, broadcastLobby);
    chatHandler(io, socket, rooms, players);

    socket.on('disconnect', () => {
      const player = players.get(socket.id);
      if (player && player.roomId) {
        const room = rooms.get(player.roomId);
        if (room) {
          io.to(player.roomId).emit('player_left', { username: player.username });
          // Mark room as abandoned
          room.status = 'abandoned';
          if (room.matchStartTime) {
            // Save incomplete match logic handled in roomHandler
          }
          rooms.delete(player.roomId);
        }
      }
      players.delete(socket.id);
      broadcastLobby(io, rooms);
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}

function broadcastLobby(io, rooms) {
  const lobbyList = [];
  rooms.forEach((room, id) => {
    if (room.status === 'waiting') {
      lobbyList.push({
        id,
        name: room.name,
        host: room.players[0]?.username,
        playerCount: room.players.length
      });
    }
  });
  io.emit('lobby_update', lobbyList);
}

module.exports = { initSocket };
