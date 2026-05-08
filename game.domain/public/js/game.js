class CaroGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.size = 15;
        this.cellSize = this.canvas.width / this.size;
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.onMove = null; // Callback
        
        // Colors
        this.lineColor = '#475569'; // slate-600
        this.xColor = '#38bdf8'; // sky-400
        this.oColor = '#f87171'; // red-400
        
        this.initEvents();
        this.drawBoard();
    }

    initEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const gridX = Math.floor(x / this.cellSize);
            const gridY = Math.floor(y / this.cellSize);
            
            if (this.onMove) {
                this.onMove(gridX, gridY);
            }
        });
    }

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.size; i++) {
            // Vertical
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();

            // Horizontal
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }

        // Draw pieces
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.board[y][x] === 'X') {
                    this.drawX(x, y);
                } else if (this.board[y][x] === 'O') {
                    this.drawO(x, y);
                }
            }
        }
    }

    drawX(x, y) {
        const padding = this.cellSize * 0.2;
        const startX = x * this.cellSize + padding;
        const startY = y * this.cellSize + padding;
        const endX = (x + 1) * this.cellSize - padding;
        const endY = (y + 1) * this.cellSize - padding;

        this.ctx.strokeStyle = this.xColor;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(endX, startY);
        this.ctx.lineTo(startX, endY);
        this.ctx.stroke();
    }

    drawO(x, y) {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2 - this.cellSize * 0.2;

        this.ctx.strokeStyle = this.oColor;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    updateBoard(newBoard) {
        this.board = newBoard;
        this.drawBoard();
    }
}
