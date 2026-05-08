/**
 * Caro RealX - Game Board (Client Side)
 * Bàn cờ 15x15
 */
const Game = (() => {
  const BOARD_SIZE = 15;
  let board = [];
  let mySymbol = null;
  let isMyTurn = false;
  let gameActive = false;
  let currentRoomId = null;
  let lastMove = null;

  function init() {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    renderBoard();
  }

  function renderBoard() {
    const el = document.getElementById('game-board');
    if (!el) return;
    el.innerHTML = '';

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        if (board[r][c]) {
          const piece = document.createElement('div');
          piece.className = `piece piece-${board[r][c]}`;
          cell.appendChild(piece);
          cell.classList.add('no-hover');
        }

        if (lastMove && lastMove.x === r && lastMove.y === c) {
          cell.classList.add('last-move');
        }

        cell.addEventListener('click', handleCellClick);
        el.appendChild(cell);
      }
    }
  }

  function handleCellClick(e) {
    if (!gameActive || !isMyTurn) return;
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);
    if (board[r][c]) return;

    // Emit move to server
    if (window.socketInstance) {
      window.socketInstance.emit('player_move', { roomId: currentRoomId, x: r, y: c });
    }
    isMyTurn = false;
    updateTurnUI(false);
  }

  function applyMove(x, y, symbol) {
    board[x][y] = symbol;
    lastMove = { x, y };
    renderBoard();
  }

  function highlightWinCells(cells) {
    if (!cells || cells.length === 0) return;
    const el = document.getElementById('game-board');
    const cellEls = el.querySelectorAll('.cell');
    cells.forEach(([r, c]) => {
      const idx = r * BOARD_SIZE + c;
      if (cellEls[idx]) cellEls[idx].classList.add('win-cell');
    });
  }

  function setMySymbol(symbol) { mySymbol = symbol; }
  function setGameActive(val) { gameActive = val; }
  function setMyTurn(val) { isMyTurn = val; updateTurnUI(val); }
  function setRoomId(id) { currentRoomId = id; }
  function reset() {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    lastMove = null;
    gameActive = false;
    isMyTurn = false;
    mySymbol = null;
    renderBoard();
  }

  function updateTurnUI(myTurn) {
    const ind = document.getElementById('turn-indicator');
    if (!ind) return;
    if (myTurn) {
      ind.textContent = '⚡ LƯỢT BẠN';
      ind.style.color = 'var(--neon-green)';
    } else {
      ind.textContent = '⏳ CHỜ...';
      ind.style.color = 'var(--neon-yellow)';
    }
  }

  function updateBoardFromState(serverBoard) {
    board = serverBoard.map(row => [...row]);
    renderBoard();
  }

  return {
    init, renderBoard, applyMove, highlightWinCells,
    setMySymbol, setGameActive, setMyTurn, setRoomId, reset,
    updateBoardFromState, updateTurnUI,
    getMySymbol: () => mySymbol,
    isActive: () => gameActive,
  };
})();
