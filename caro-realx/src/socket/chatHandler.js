module.exports = function chatHandler(io, socket, rooms, players) {
  socket.on('send_message', ({ roomId, message }) => {
    const player = players.get(socket.id);
    if (!player) return;
    if (!message || message.trim().length === 0) return;
    if (message.length > 200) return;

    io.to(roomId).emit('receive_message', {
      username: player.username,
      message: message.trim(),
      time: new Date().toISOString()
    });
  });

  socket.on('send_lobby_message', ({ message }) => {
    const player = players.get(socket.id);
    if (!player) return;
    if (!message || message.trim().length === 0) return;

    io.emit('receive_lobby_message', {
      username: player.username,
      message: message.trim(),
      time: new Date().toISOString()
    });
  });
};
