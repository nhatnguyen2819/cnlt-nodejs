const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'view', req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();

    // Default to .html extension if none is provided
    if (!extname && req.url !== '/') {
        filePath += '.html';
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml'
            };
            const contentType = mimeTypes[String(path.extname(filePath)).toLowerCase()] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

// ============================================
// BÀI TẬP VỀ FILE SYSTEM (fs)
// ============================================

// Tạo thư mục 'files' nếu chưa có
const dirPath = path.join(__dirname, 'files');
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log("Thư mục 'files' đã được tạo.");
}

const txtPath = path.join(dirPath, 'cats.txt');
const pngPath = path.join(dirPath, 'cat.png');
const newTxtPath = path.join(dirPath, 'những con mèo.txt');

// Hàm chạy các ví dụ về fs
async function runFsDemo() {
    try {
        // 1. Tạo file: fs.writeFile() - Tạo file text
        await fs.promises.writeFile(txtPath, "Ragdoll, Scottish fold, British shorthair...");
        console.log("Thêm file cats.txt thành công.");

        // Tạo file ảnh bằng buffer (fs.writeFile buffer)
        // Lưu ý: Chuỗi base64 đã được rút gọn thành một hình cơ bản (1x1 pixel trong suốt) để code không bị quá dài
        const base64String = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        const fileContentBuffer = Buffer.from(base64String, "base64");
        await fs.promises.writeFile(pngPath, fileContentBuffer);
        console.log("The file cat.png was successfully saved.");

        // 2. Cập nhật file: fs.appendFile()
        await fs.promises.appendFile(txtPath, ". Korat cat");
        console.log("Thêm 'Korat cat' vào cats.txt thành công (appendFile).");

        // 3. Đổi tên file: fs.rename()
        await fs.promises.rename(txtPath, newTxtPath);
        console.log("The file was successfully renamed to 'những con mèo.txt'.");

        // 4. Đọc file: fs.readFile()
        const data = await fs.promises.readFile(newTxtPath, 'utf8');
        console.log("Nội dung file đọc được (readFile): ", data);

        // 5. Xóa file: fs.unlink()
        // Code xóa file được comment lại để bạn có thể xem các file đã được tạo ra trong thư mục 'files' nhé!
        // Khi cần test xóa, bạn hãy bỏ comment 2 dòng bên dưới.
        // await fs.promises.unlink(newTxtPath);
        // console.log("The file was successfully deleted (unlink).");

    } catch (err) {
        console.error("Có lỗi xảy ra: ", err);
    }
}

// Gọi hàm chạy thử
runFsDemo();
