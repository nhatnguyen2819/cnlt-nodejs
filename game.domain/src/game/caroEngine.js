class CaroEngine {
    constructor(size = 15) {
        this.size = size;
        this.board = Array(size).fill(null).map(() => Array(size).fill(null)); // null, 'X', or 'O'
        this.currentTurn = 'X'; // X đi trước
        this.status = 'playing'; // playing, win_x, win_o, draw
        this.movesCount = 0;
    }

    makeMove(x, y, player) {
        if (this.status !== 'playing') return { success: false, message: 'Game over' };
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return { success: false, message: 'Invalid move' };
        if (this.board[y][x] !== null) return { success: false, message: 'Cell already taken' };
        if (player !== this.currentTurn) return { success: false, message: 'Not your turn' };

        this.board[y][x] = player;
        this.movesCount++;

        if (this.checkWin(x, y, player)) {
            this.status = player === 'X' ? 'win_x' : 'win_o';
        } else if (this.movesCount === this.size * this.size) {
            this.status = 'draw';
        } else {
            this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
        }

        return { success: true, status: this.status, board: this.board, currentTurn: this.currentTurn };
    }

    checkWin(x, y, player) {
        // Kiểm tra 4 hướng: ngang, dọc, chéo chính, chéo phụ
        const directions = [
            [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }], // Ngang
            [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }], // Dọc
            [{ dx: -1, dy: -1 }, { dx: 1, dy: 1 }], // Chéo chính \
            [{ dx: -1, dy: 1 }, { dx: 1, dy: -1 }]  // Chéo phụ /
        ];

        for (let dir of directions) {
            let count = 1; // Tính cả quân cờ vừa đánh
            let blockedEnds = 0;

            for (let i = 0; i < 2; i++) {
                let currX = x + dir[i].dx;
                let currY = y + dir[i].dy;

                while (currX >= 0 && currX < this.size && currY >= 0 && currY < this.size && this.board[currY][currX] === player) {
                    count++;
                    currX += dir[i].dx;
                    currY += dir[i].dy;
                }

                // Check chặn đầu
                if (currX < 0 || currX >= this.size || currY < 0 || currY >= this.size || (this.board[currY][currX] !== null && this.board[currY][currX] !== player)) {
                    blockedEnds++;
                }
            }

            // Luật Caro: 5 quân liên tiếp và không bị chặn 2 đầu
            if (count >= 5 && blockedEnds < 2) {
                return true;
            }
        }
        return false;
    }

    getGameState() {
        return {
            board: this.board,
            currentTurn: this.currentTurn,
            status: this.status
        };
    }
}

module.exports = CaroEngine;
