const socket = io();
let currentUser = null;
let currentRoom = null;
let mySymbol = null; // X or O
const gameCanvas = new CaroGame('gameCanvas');

// Elements
const loginScreen = document.getElementById('loginScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const gameScreen = document.getElementById('gameScreen');

const userInfo = document.getElementById('userInfo');
const displayUsername = document.getElementById('displayUsername');
const userAvatar = document.getElementById('userAvatar');
const roomList = document.getElementById('roomList');

const playerXCard = document.getElementById('playerXCard');
const playerOCard = document.getElementById('playerOCard');
const playerXName = document.getElementById('playerXName');
const playerOName = document.getElementById('playerOName');
const gameStatus = document.getElementById('gameStatus');
const roomNameDisplay = document.getElementById('roomNameDisplay');
const restartBtn = document.getElementById('restartBtn');

const chatMessages = document.getElementById('chatMessages');

// --- Events UI ---
document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        socket.emit('user_login', username);
    }
});

document.getElementById('createRoomBtn').addEventListener('click', () => {
    socket.emit('create_room', `Room of ${currentUser.username}`);
});

document.getElementById('leaveRoomBtn').addEventListener('click', () => {
    socket.disconnect(); 
    socket.connect(); 
    socket.emit('user_login', currentUser.username); // Relogin to go to lobby
    showScreen(lobbyScreen);
});

document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    if (input.value.trim()) {
        socket.emit('send_message', input.value.trim());
        input.value = '';
    }
});

restartBtn.addEventListener('click', () => {
    socket.emit('restart_game');
});

// Send move to server
gameCanvas.onMove = (x, y) => {
    socket.emit('player_move', { x, y });
};

// --- Socket Handlers ---
socket.on('login_success', (user) => {
    currentUser = user;
    displayUsername.textContent = user.username;
    userAvatar.textContent = user.username.charAt(0).toUpperCase();
    userInfo.classList.remove('hidden');
    showScreen(lobbyScreen);
    socket.emit('get_lobby');
});

socket.on('error', (msg) => {
    alert(msg);
});

socket.on('lobby_update', (rooms) => {
    roomList.innerHTML = '';
    if (rooms.length === 0) {
        roomList.innerHTML = '<p class="text-gray-400 col-span-2 text-center py-8">No rooms available. Create one!</p>';
        return;
    }

    rooms.forEach(room => {
        const div = document.createElement('div');
        div.className = 'bg-gray-700 p-4 rounded-lg flex justify-between items-center hover:bg-gray-600 transition-colors cursor-pointer border border-gray-600';
        div.innerHTML = `
            <div>
                <h3 class="font-bold text-teal-300">${room.roomName}</h3>
                <p class="text-sm text-gray-400">Players: ${room.playersCount}/2</p>
            </div>
            <button class="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded text-sm font-bold shadow" onclick="joinRoom('${room.roomId}')">Join</button>
        `;
        roomList.appendChild(div);
    });
});

window.joinRoom = (roomId) => {
    socket.emit('join_room', roomId);
};

socket.on('room_created', (data) => {
    currentRoom = data.roomId;
    mySymbol = data.player;
    roomNameDisplay.textContent = `Room: ${data.roomName}`;
    chatMessages.innerHTML = '';
    showScreen(gameScreen);
});

socket.on('room_joined', (data) => {
    currentRoom = data.roomId;
    mySymbol = data.player;
    roomNameDisplay.textContent = `Room: ${data.roomName}`;
    chatMessages.innerHTML = '';
    showScreen(gameScreen);
});

socket.on('players_update', (players) => {
    playerXName.textContent = players.X ? players.X.username : 'Waiting...';
    playerOName.textContent = players.O ? players.O.username : 'Waiting...';
    
    if (players.X && players.O) {
        gameStatus.textContent = "Game started!";
        gameStatus.className = "text-lg font-bold text-teal-400 mb-2";
    } else {
        gameStatus.textContent = "Waiting for players...";
        gameStatus.className = "text-lg font-bold text-yellow-400 mb-2";
        restartBtn.classList.add('hidden');
    }
});

socket.on('game_state_update', (state) => {
    gameCanvas.updateBoard(state.board);
    
    // Update active player UI
    if (state.status === 'playing') {
        if (state.currentTurn === 'X') {
            playerXCard.classList.add('active');
            playerOCard.classList.remove('active');
            gameStatus.textContent = "X's Turn";
            gameStatus.className = "text-lg font-bold text-blue-400 mb-2";
        } else {
            playerOCard.classList.add('active');
            playerXCard.classList.remove('active');
            gameStatus.textContent = "O's Turn";
            gameStatus.className = "text-lg font-bold text-red-400 mb-2";
        }
    }
});

socket.on('game_over', (status) => {
    playerXCard.classList.remove('active');
    playerOCard.classList.remove('active');
    
    if (status === 'win_x') {
        gameStatus.textContent = "X WINS!";
        gameStatus.className = "text-2xl font-bold text-blue-500 mb-2 glow-text";
    } else if (status === 'win_o') {
        gameStatus.textContent = "O WINS!";
        gameStatus.className = "text-2xl font-bold text-red-500 mb-2 glow-text";
    } else {
        gameStatus.textContent = "DRAW!";
        gameStatus.className = "text-2xl font-bold text-gray-400 mb-2";
    }
    
    restartBtn.classList.remove('hidden');
});

socket.on('receive_message', (msg) => {
    const div = document.createElement('div');
    div.className = "mb-2 break-words";
    const time = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let colorClass = "text-teal-300";
    if (msg.username === 'System') colorClass = "text-yellow-400 italic";
    else if (currentUser && msg.username === currentUser.username) colorClass = "text-blue-300";
    
    div.innerHTML = `
        <span class="text-gray-500 text-xs mr-1">[${time}]</span>
        <span class="font-bold ${colorClass}">${msg.username}:</span> 
        <span class="text-gray-200">${msg.message}</span>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

function showScreen(screen) {
    loginScreen.classList.add('hidden');
    lobbyScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    
    screen.classList.remove('hidden');
    
    if(screen === gameScreen) {
        // resize canvas correct
        gameCanvas.drawBoard();
    }
}
