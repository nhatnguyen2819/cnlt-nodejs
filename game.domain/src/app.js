const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false, // Tắt CSP để cho phép load các script từ CDN nếu cần trong môi trường dev
}));
app.use(morgan('dev'));
app.use(express.json());

// Phục vụ các file tĩnh trong thư mục public
app.use(express.static(path.join(__dirname, '../public')));

// Basic route cho API check status
app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', message: 'Caro RealX Server is running' });
});

// Bất kỳ route nào không khớp trả về file index.html (để xử lý routing ở client nếu cần)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!' });
});

module.exports = app;
