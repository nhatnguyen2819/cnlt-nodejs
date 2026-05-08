/**
 * Caro RealX - App Controller
 */
const App = (() => {
  let socket = null;
  let myUsername = null;
  let myRoomId = null;
  let currentView = 'lobby';

  // ===== LOGIN =====
  function login() {
    const input = document.getElementById('username-input');
    const username = input.value.trim();
    if (username.length < 2) return toast('Tên phải có ít nhất 2 ký tự!', 'error');
    if (username.length > 20) return toast('Tên tối đa 20 ký tự!', 'error');

    myUsername = username;
    initSocket();
  }

  function logout() {
    if (socket) socket.disconnect();
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    myUsername = null;
    myRoomId = null;
  }

  // ===== SOCKET =====
  function initSocket() {
    socket = io();
    window.socketInstance = socket;

    socket.on('connect', () => {
      socket.emit('register', myUsername);
    });

    socket.on('registered', ({ socketId, username }) => {
      // Login success - switch screens
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('main-screen').classList.remove('hidden');
      document.getElementById('header-username').textContent = username;
      document.getElementById('header-avatar').textContent = username[0].toUpperCase();
      showView('lobby');
      toast(`Chào mừng, ${username}!`, 'success');
    });

    socket.on('lobby_update', (rooms) => {
      renderRoomList(rooms);
    });

    socket.on('room_created', ({ roomId, roomName }) => {
      myRoomId = roomId;
      Game.setRoomId(roomId);
      document.getElementById('room-id-display').textContent = `Phòng: ${roomId}`;
      showView('game');
      showGameWaiting();
      toast(`Phòng "${roomName}" đã tạo. Mã: ${roomId}`, 'info');
    });

    socket.on('join_error', ({ message }) => {
      toast(message, 'error');
    });

    socket.on('game_start', ({ roomId, players, currentTurn, board }) => {
      myRoomId = roomId;
      Game.setRoomId(roomId);
      startGame(players, currentTurn, board);
    });

    socket.on('game_state_update', ({ board, lastMove, currentTurn }) => {
      if (board) Game.updateBoardFromState(board);
      if (lastMove) Game.applyMove(lastMove.x, lastMove.y, lastMove.symbol);
      if (currentTurn) {
        const isMyTurn = currentTurn === myUsername;
        Game.setMyTurn(isMyTurn);
        updatePlayerCards(currentTurn);
      }
    });

    socket.on('game_over', ({ result, winner, surrenderer, winCells }) => {
      Game.setGameActive(false);
      Game.setMyTurn(false);
      if (winCells && winCells.length > 0) Game.highlightWinCells(winCells);

      let title, desc, cls;
      if (result === 'draw') {
        title = '🤝 HÒA!';
        desc = 'Không ai thắng lần này.';
        cls = 'draw';
      } else if (result === 'surrender') {
        if (surrenderer === myUsername) { title = '😔 BẠN ĐÃ ĐẦU HÀNG'; cls = 'lose'; }
        else { title = '🎉 CHIẾN THẮNG!'; cls = 'win'; }
        desc = `${surrenderer} đã đầu hàng. ${winner} thắng!`;
      } else {
        if (winner === myUsername) { title = '🏆 CHIẾN THẮNG!'; cls = 'win'; }
        else { title = '💀 THUA RỒI...'; cls = 'lose'; }
        desc = winner ? `${winner} đã thắng!` : '';
      }

      setTimeout(() => showGameOver(title, desc, cls), 800);
      addSystemChat(`🏁 Kết thúc: ${winner ? winner + ' thắng!' : 'Hòa!'}`);
    });

    socket.on('player_left', ({ username }) => {
      toast(`${username} đã rời phòng!`, 'error');
      addSystemChat(`⚠️ ${username} đã rời phòng.`);
      Game.setGameActive(false);
    });

    socket.on('move_error', ({ message }) => {
      toast(message, 'error');
      Game.setMyTurn(true);
    });

    // Chat
    socket.on('receive_message', ({ username, message, time }) => {
      addChat(username, message, time, username === myUsername);
    });

    socket.on('receive_lobby_message', ({ username, message, time }) => {
      addChat(username, message, time, username === myUsername);
    });

    socket.on('disconnect', () => {
      toast('Mất kết nối với server!', 'error');
    });
  }

  // ===== ROOM =====
  function openCreateRoom() {
    document.getElementById('room-name-input').value = '';
    openModal('create-room-modal');
  }

  function createRoom() {
    const name = document.getElementById('room-name-input').value.trim() || `Phòng của ${myUsername}`;
    socket.emit('create_room', { roomName: name });
    closeModal('create-room-modal');
  }

  function joinRoom(roomId) {
    if (myRoomId) return toast('Bạn đang ở trong phòng!', 'error');
    socket.emit('join_room', { roomId });
    showView('game');
  }

  function surrender() {
    if (!myRoomId || !Game.isActive()) return;
    if (!confirm('Bạn có chắc muốn đầu hàng không?')) return;
    socket.emit('surrender', { roomId: myRoomId });
  }

  function backToLobby() {
    closeModal('gameover-modal');
    myRoomId = null;
    Game.reset();
    showView('lobby');
  }

  // ===== GAME UI =====
  function startGame(players, currentTurn, serverBoard) {
    // Find my symbol
    const me = players.find(p => p.username === myUsername);
    if (me) {
      Game.setMySymbol(me.symbol);
      document.getElementById('p1-name').textContent = players.find(p => p.symbol === 'X')?.username || '?';
      document.getElementById('p2-name').textContent = players.find(p => p.symbol === 'O')?.username || '?';
    }

    if (serverBoard) Game.updateBoardFromState(serverBoard);
    Game.setGameActive(true);

    const isMyTurn = currentTurn === myUsername;
    Game.setMyTurn(isMyTurn);
    updatePlayerCards(currentTurn);
    document.getElementById('turn-indicator').textContent = isMyTurn ? '⚡ LƯỢT BẠN' : '⏳ CHỜ...';

    addSystemChat(`🎮 Game bắt đầu! ${players.map(p => p.username + '(' + p.symbol + ')').join(' vs ')}`);
  }

  function showGameWaiting() {
    document.getElementById('p1-name').textContent = myUsername;
    document.getElementById('p2-name').textContent = '???';
    document.getElementById('turn-indicator').textContent = '⏳ CHỜ ĐỐI THỦ...';
    Game.init();
  }

  function updatePlayerCards(currentTurnUsername) {
    const p1Card = document.getElementById('p1-card');
    const p2Card = document.getElementById('p2-card');
    const p1Name = document.getElementById('p1-name').textContent;
    p1Card.classList.toggle('active', p1Name === currentTurnUsername);
    p2Card.classList.toggle('active', p1Name !== currentTurnUsername);
  }

  function renderRoomList(rooms) {
    const list = document.getElementById('room-list');
    if (!rooms || rooms.length === 0) {
      list.innerHTML = '<div class="room-empty">Chưa có phòng nào.<br>Hãy tạo phòng mới!</div>';
      return;
    }
    list.innerHTML = rooms.map(r => `
      <div class="room-item" onclick="App.joinRoom('${r.id}')">
        <div class="room-name">${escapeHtml(r.name)}</div>
        <div class="room-info">
          <span class="room-host">👤 ${escapeHtml(r.host)}</span> &nbsp;·&nbsp; Chờ đối thủ
        </div>
      </div>
    `).join('');
  }

  // ===== VIEWS =====
  function showView(view) {
    currentView = view;
    document.getElementById('lobby-view').style.display = view === 'lobby' ? '' : 'none';
    document.getElementById('leaderboard-view').classList.toggle('active', view === 'leaderboard');
    document.getElementById('game-view').classList.toggle('active', view === 'game');

    document.querySelectorAll('.nav-tab').forEach((t, i) => {
      t.classList.toggle('active', (i === 0 && view !== 'leaderboard') || (i === 1 && view === 'leaderboard'));
    });
  }

  async function showLeaderboard() {
    showView('leaderboard');
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      const tbody = document.getElementById('lb-tbody');
      const rankClasses = ['gold', 'silver', 'bronze'];
      tbody.innerHTML = data.map((u, i) => `
        <tr>
          <td class="lb-rank ${rankClasses[i] || ''}">${i + 1}</td>
          <td>${escapeHtml(u.username)}</td>
          <td class="lb-wins">${u.wins}</td>
          <td style="color:var(--neon-pink)">${u.losses || 0}</td>
          <td style="color:var(--text-secondary)">${u.draws || 0}</td>
          <td>${u.totalMatches}</td>
        </tr>
      `).join('');
    } catch {
      toast('Không thể tải bảng xếp hạng', 'error');
    }
  }

  // ===== CHAT =====
  function sendChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    if (myRoomId) {
      socket.emit('send_message', { roomId: myRoomId, message: msg });
    } else {
      socket.emit('send_lobby_message', { message: msg });
    }
  }

  function addChat(username, message, time, isSelf) {
    const el = document.getElementById('chat-messages');
    const t = time ? new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
    const div = document.createElement('div');
    div.className = `chat-msg ${isSelf ? 'self' : ''}`;
    div.innerHTML = `<div class="msg-user">${escapeHtml(username)} <span class="msg-time">${t}</span></div><div>${escapeHtml(message)}</div>`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }

  function addSystemChat(message) {
    const el = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg system';
    div.textContent = message;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }

  // ===== MODAL =====
  function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
  function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

  function showGameOver(title, desc, cls) {
    document.getElementById('go-title').textContent = title;
    document.getElementById('go-title').className = `modal-title ${cls}`;
    document.getElementById('go-desc').textContent = desc;
    openModal('gameover-modal');
  }

  // ===== TOAST =====
  function toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3000);
  }

  // ===== UTILS =====
  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (document.getElementById('login-screen') && !document.getElementById('login-screen').classList.contains('hidden')) {
        login();
      }
      const chatInput = document.getElementById('chat-input');
      if (document.activeElement === chatInput) sendChat();
      const roomInput = document.getElementById('room-name-input');
      if (document.activeElement === roomInput) createRoom();
    }
  });

  return {
    login, logout, openCreateRoom, createRoom, joinRoom,
    surrender, backToLobby, showView, showLeaderboard,
    sendChat, openModal, closeModal, toast
  };
})();
