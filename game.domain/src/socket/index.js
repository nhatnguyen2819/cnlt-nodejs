const { Server } = require('socket.io');
const User = require('../models/User');
const CaroEngine = require('../game/caroEngine');

let io;
const activeGames = {}; // roomId -> CaroEngine instance

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        let currentUserId = null;
        let currentRoomId = null;

        // Xử lý user join (nhập username)
        socket.on('user_login', async (username) => {
            try {
                let user = await User.findOne({ username });
                if (!user) {
                    user = await User.create({ username, status: 'online', socketId: socket.id });
                } else {
                    user.status = 'online';
                    user.socketId = socket.id;
                    await user.save();
                }
                currentUserId = user._id;
                socket.emit('login_success', user);
                broadcastLobbyUpdate();
            } catch (err) {
                socket.emit('error', 'Login failed');
            }
        });

        // Xử lý tạo phòng
        socket.on('create_room', async (roomName) => {
            const roomId = Math.random().toString(36).substring(2, 9);
            const user = await User.findById(currentUserId);
            
            // Xóa người dùng khỏi các room khác nếu có
            if (currentRoomId) {
                socket.leave(currentRoomId);
            }

            socket.join(roomId);
            currentRoomId = roomId;

            activeGames[roomId] = {
                engine: new CaroEngine(15),
                players: {
                    X: user,
                    O: null
                },
                roomName: roomName || `Room ${roomId}`
            };

            socket.emit('room_created', { roomId, roomName: activeGames[roomId].roomName, player: 'X' });
            io.to(roomId).emit('game_state_update', activeGames[roomId].engine.getGameState());
            io.to(roomId).emit('players_update', activeGames[roomId].players);
            broadcastLobbyUpdate();
        });

        // Xử lý join phòng
        socket.on('join_room', async (roomId) => {
            const game = activeGames[roomId];
            if (!game) {
                return socket.emit('error', 'Room not found');
            }
            if (game.players.O && game.players.X) {
                return socket.emit('error', 'Room is full');
            }

            const user = await User.findById(currentUserId);
            
            if (currentRoomId) socket.leave(currentRoomId);
            socket.join(roomId);
            currentRoomId = roomId;

            let assignedSymbol = 'O';
            if (!game.players.X) assignedSymbol = 'X';
            
            game.players[assignedSymbol] = user;

            socket.emit('room_joined', { roomId, roomName: game.roomName, player: assignedSymbol });
            io.to(roomId).emit('players_update', game.players);
            io.to(roomId).emit('game_state_update', game.engine.getGameState());
            broadcastLobbyUpdate();
            
            // System message
            io.to(roomId).emit('receive_message', {
                username: 'System',
                message: `${user.username} has joined the room.`,
                timestamp: new Date()
            });
        });

        // Xử lý đánh cờ
        socket.on('player_move', ({ x, y }) => {
            if (!currentRoomId || !activeGames[currentRoomId]) return;
            const game = activeGames[currentRoomId];
            
            // Xác định player đang đánh là X hay O
            let playerSymbol = null;
            if (game.players.X && game.players.X._id.toString() === currentUserId.toString()) playerSymbol = 'X';
            if (game.players.O && game.players.O._id.toString() === currentUserId.toString()) playerSymbol = 'O';

            if (!playerSymbol) return socket.emit('error', 'You are not a player in this room');

            const result = game.engine.makeMove(x, y, playerSymbol);
            if (result.success) {
                io.to(currentRoomId).emit('game_state_update', game.engine.getGameState());
                
                if (result.status !== 'playing') {
                    // Update user stats
                    io.to(currentRoomId).emit('game_over', result.status);
                    io.to(currentRoomId).emit('receive_message', {
                        username: 'System',
                        message: `Game over! Status: ${result.status}`,
                        timestamp: new Date()
                    });
                }
            } else {
                socket.emit('error', result.message);
            }
        });

        // Xử lý chat
        socket.on('send_message', async (message) => {
            if (!currentRoomId) return;
            const user = await User.findById(currentUserId);
            io.to(currentRoomId).emit('receive_message', {
                username: user ? user.username : 'Guest',
                message: message,
                timestamp: new Date()
            });
        });

        // Restart game
        socket.on('restart_game', () => {
            if (!currentRoomId || !activeGames[currentRoomId]) return;
            activeGames[currentRoomId].engine = new CaroEngine(15);
            io.to(currentRoomId).emit('game_state_update', activeGames[currentRoomId].engine.getGameState());
            io.to(currentRoomId).emit('receive_message', {
                username: 'System',
                message: `Game restarted. X goes first.`,
                timestamp: new Date()
            });
        });

        // Lấy danh sách lobby
        socket.on('get_lobby', () => {
            socket.emit('lobby_update', getLobbyData());
        });

        // Ngắt kết nối
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.id}`);
            if (currentUserId) {
                await User.findByIdAndUpdate(currentUserId, { status: 'offline', socketId: null });
            }
            if (currentRoomId && activeGames[currentRoomId]) {
                const game = activeGames[currentRoomId];
                if (game.players.X && game.players.X._id.toString() === currentUserId?.toString()) game.players.X = null;
                if (game.players.O && game.players.O._id.toString() === currentUserId?.toString()) game.players.O = null;
                
                io.to(currentRoomId).emit('players_update', game.players);
                
                // Xóa room nếu không còn ai
                if (!game.players.X && !game.players.O) {
                    delete activeGames[currentRoomId];
                } else {
                    io.to(currentRoomId).emit('receive_message', {
                        username: 'System',
                        message: `A player disconnected.`,
                        timestamp: new Date()
                    });
                }
            }
            broadcastLobbyUpdate();
        });
    });

    const getLobbyData = () => {
        const rooms = [];
        for (let roomId in activeGames) {
            const game = activeGames[roomId];
            rooms.push({
                roomId,
                roomName: game.roomName,
                playersCount: (game.players.X ? 1 : 0) + (game.players.O ? 1 : 0)
            });
        }
        return rooms;
    };

    const broadcastLobbyUpdate = () => {
        io.emit('lobby_update', getLobbyData());
    };
};

module.exports = initSocket;
