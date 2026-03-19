const http = require('http');

const server = http.createServer((req, res) => {
    console.log(`Đang truy cập đường dẫn: ${req.url}`);

    // Thiết lập Header mặc định cho mọi phản hồi để hiển thị đúng tiếng Việt
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    // Xử lý Routing cơ bản
    switch (req.url) {
        case '/':
            res.writeHead(200);
            res.end('Trang chủ');
            break;
            
        case '/about':
            res.writeHead(200);
            res.end('Trang giới thiệu');
            break;
            
        case '/contact':
            res.writeHead(200);
            res.end('Trang liên hệ');
            break;
            
        default:
            // Trả về lỗi 404 cho các URL không tồn tại
            res.writeHead(404);
            res.end('Không tìm thấy trang');
            break;
    }
});

// Lắng nghe kết nối tại port 3000
server.listen(3000, () => {
    console.log('Server đang chạy tại: http://localhost:3000');
});