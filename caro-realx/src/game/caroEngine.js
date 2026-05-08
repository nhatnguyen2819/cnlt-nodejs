/**
 * Caro Engine - Game logic for 15x15 Gomoku
 * Rule: 5 in a row wins. Blocked on both sides does NOT count (standard Caro rule).
 */

const BOARD_SIZE = 15;
const WIN_LENGTH = 5;

function createBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function isValidMove(board, x, y) {
  return (
    x >= 0 && x < BOARD_SIZE &&
    y >= 0 && y < BOARD_SIZE &&
    board[x][y] === null
  );
}

function applyMove(board, x, y, player) {
  const newBoard = board.map(row => [...row]);
  newBoard[x][y] = player;
  return newBoard;
}

/**
 * Check if player wins after placing at (x, y).
 * Uses standard Caro rule: 5 in a row, BLOCKED both sides = not win.
 */
function checkWin(board, x, y, player) {
  const directions = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal \
    [1, -1]  // diagonal /
  ];

  for (const [dx, dy] of directions) {
    const result = countLine(board, x, y, dx, dy, player);
    if (result.count >= WIN_LENGTH && !result.blocked) {
      return { win: true, direction: [dx, dy], cells: result.cells };
    }
  }
  return { win: false };
}

function countLine(board, x, y, dx, dy, player) {
  let count = 1;
  let cells = [[x, y]];
  let blockedNeg = false;
  let blockedPos = false;

  // Positive direction
  for (let i = 1; i < WIN_LENGTH + 1; i++) {
    const nx = x + dx * i;
    const ny = y + dy * i;
    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
      blockedPos = true;
      break;
    }
    if (board[nx][ny] === player) {
      count++;
      cells.push([nx, ny]);
    } else {
      if (board[nx][ny] !== null) blockedPos = true;
      break;
    }
  }

  // Negative direction
  for (let i = 1; i < WIN_LENGTH + 1; i++) {
    const nx = x - dx * i;
    const ny = y - dy * i;
    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
      blockedNeg = true;
      break;
    }
    if (board[nx][ny] === player) {
      count++;
      cells.push([nx, ny]);
    } else {
      if (board[nx][ny] !== null) blockedNeg = true;
      break;
    }
  }

  return { count, blocked: blockedNeg && blockedPos, cells };
}

function checkDraw(board) {
  return board.every(row => row.every(cell => cell !== null));
}

module.exports = { createBoard, isValidMove, applyMove, checkWin, checkDraw, BOARD_SIZE };
