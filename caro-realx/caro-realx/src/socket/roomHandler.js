const { v4: uuidv4 } = require('uuid');
const { createBoard, isValidMove, applyMove, checkWin, checkDraw } = require('../game/caroEngine');
const Match = require('../models/Match');
const User = require('../models/User');

module.exports = function roomHandler(io, socket, rooms, players, broadcastLobby) {

  socket.on('create_room', ({ roomName }) => {
    const player = players.get(socket.id);
    if (!player) return;

    const roomId = uuidv4().slice(0, 8).toUpperCase();
    const room = {
      id: roomId,
      name: roomName || `Phòng của ${player.username}`,
      status: 'waiting',
      players: [{ socketId: socket.id, username: player.username, symbol: 'X' }],
      board: createBoard(),
      currentTurn: null,
      matchStartTime: null,
      moves: []
    };

    rooms.set(roomId, room);
    player.roomId = roomId;
    socket.join(roomId);
    socket.emit('room_created', { roomId, roomName: room.name });
    broadcastLobby(io, rooms);
  });

  socket.on('join_room', ({ roomId }) => {
    const player = players.get(socket.id);
    if (!player) return;

    const room = rooms.get(roomId);
    if (!room || room.status !== 'waiting' || room.players.length >= 2) {
      return socket.emit('join_error', { message: 'Phòng không tồn tại hoặc đã đầy!' });
    }

    room.players.push({ socketId: socket.id, username: player.username, symbol: 'O' });
    room.status = 'playing';
    room.currentTurn = room.players[0].socketId; // X goes first
    room.matchStartTime = Date.now();
    player.roomId = roomId;
    socket.join(roomId);

    io.to(roomId).emit('game_start', {
      roomId,
      players: room.players.map(p => ({ username: p.username, symbol: p.symbol })),
      currentTurn: room.players[0].username,
      board: room.board
    });

    broadcastLobby(io, rooms);
  });

  socket.on('player_move', async ({ roomId, x, y }) => {
    const player = players.get(socket.id);
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;
    if (room.currentTurn !== socket.id) {
      return socket.emit('move_error', { message: 'Chưa đến lượt của bạn!' });
    }
    if (!isValidMove(room.board, x, y)) {
      return socket.emit('move_error', { message: 'Nước đi không hợp lệ!' });
    }

    const currentPlayerInfo = room.players.find(p => p.socketId === socket.id);
    room.board = applyMove(room.board, x, y, currentPlayerInfo.symbol);
    room.moves.push({ socketId: socket.id, x, y, time: new Date() });

    // Check win
    const winResult = checkWin(room.board, x, y, currentPlayerInfo.symbol);
    if (winResult.win) {
      room.status = 'finished';
      io.to(roomId).emit('game_state_update', { board: room.board, lastMove: { x, y, symbol: currentPlayerInfo.symbol } });
      io.to(roomId).emit('game_over', {
        result: 'win',
        winner: currentPlayerInfo.username,
        winCells: winResult.cells
      });
      await saveMatch(room, currentPlayerInfo.socketId, false);
      rooms.delete(roomId);
      return;
    }

    // Check draw
    if (checkDraw(room.board)) {
      room.status = 'finished';
      io.to(roomId).emit('game_state_update', { board: room.board, lastMove: { x, y, symbol: currentPlayerInfo.symbol } });
      io.to(roomId).emit('game_over', { result: 'draw', winner: null, winCells: [] });
      await saveMatch(room, null, true);
      rooms.delete(roomId);
      return;
    }

    // Switch turn
    const otherPlayer = room.players.find(p => p.socketId !== socket.id);
    room.currentTurn = otherPlayer.socketId;

    io.to(roomId).emit('game_state_update', {
      board: room.board,
      lastMove: { x, y, symbol: currentPlayerInfo.symbol },
      currentTurn: otherPlayer.username
    });
  });

  socket.on('surrender', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'playing') return;
    const surrenderingPlayer = room.players.find(p => p.socketId === socket.id);
    const winner = room.players.find(p => p.socketId !== socket.id);
    if (!surrenderingPlayer || !winner) return;

    room.status = 'finished';
    io.to(roomId).emit('game_over', {
      result: 'surrender',
      winner: winner.username,
      surrenderer: surrenderingPlayer.username,
      winCells: []
    });
    saveMatch(room, winner.socketId, false);
    rooms.delete(roomId);
    broadcastLobby(io, rooms);
  });

  async function saveMatch(room, winnerSocketId, isDraw) {
    try {
      if (room.players.length < 2) return;
      const [p1, p2] = room.players;

      const [user1, user2] = await Promise.all([
        User.findOneAndUpdate({ username: p1.username }, { $inc: { totalMatches: 1 } }, { new: true, upsert: true }),
        User.findOneAndUpdate({ username: p2.username }, { $inc: { totalMatches: 1 } }, { new: true, upsert: true })
      ]);

      if (!user1 || !user2) return;

      let winnerId = null;
      if (isDraw) {
        await User.updateOne({ _id: user1._id }, { $inc: { draws: 1 } });
        await User.updateOne({ _id: user2._id }, { $inc: { draws: 1 } });
      } else if (winnerSocketId) {
        const winnerUsername = room.players.find(p => p.socketId === winnerSocketId)?.username;
        const loserUsername = room.players.find(p => p.socketId !== winnerSocketId)?.username;
        winnerId = winnerUsername === p1.username ? user1._id : user2._id;
        const loserId = winnerUsername === p1.username ? user2._id : user1._id;
        await User.updateOne({ _id: winnerId }, { $inc: { wins: 1 } });
        await User.updateOne({ _id: loserId }, { $inc: { losses: 1 } });
      }

      const duration = room.matchStartTime ? Math.round((Date.now() - room.matchStartTime) / 1000) : 0;
      const playerX = p1.symbol === 'X' ? user1 : user2;
      const playerO = p1.symbol === 'O' ? user1 : user2;

      await Match.create({
        roomId: room.id,
        playerX: playerX._id,
        playerO: playerO._id,
        winner: winnerId,
        isDraw,
        moves: room.moves.map((m, i) => ({
          player: room.players.find(p => p.socketId === m.socketId)?.username === p1.username ? user1._id : user2._id,
          x: m.x,
          y: m.y,
          time: m.time
        })),
        duration
      });
    } catch (err) {
      console.error('Save match error:', err.message);
    }
  }
};
