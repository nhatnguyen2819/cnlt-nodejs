const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'view', req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();

    
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


const dirPath = path.join(__dirname, 'files');
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log("Thư mục 'files' đã được tạo.");
}

const txtPath = path.join(dirPath, 'cats.txt');
const pngPath = path.join(dirPath, 'cat.png');
const newTxtPath = path.join(dirPath, 'những con mèo.txt');


async function runFsDemo() {
    try {
        
        await fs.promises.writeFile(txtPath, "Ragdoll, Scottish fold, British shorthair...");
        console.log("Thêm file cats.txt thành công.");

        
        const base64String = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        const fileContentBuffer = Buffer.from(base64String, "base64");
        await fs.promises.writeFile(pngPath, fileContentBuffer);
        console.log("The file cat.png was successfully saved.");

        
        await fs.promises.appendFile(txtPath, ". Korat cat");
        console.log("Thêm 'Korat cat' vào cats.txt thành công (appendFile).");

       
        await fs.promises.rename(txtPath, newTxtPath);
        console.log("The file was successfully renamed to 'những con mèo.txt'.");

       
        const data = await fs.promises.readFile(newTxtPath, 'utf8');
        console.log("Nội dung file đọc được (readFile): ", data);

        

    } catch (err) {
        console.error("Có lỗi xảy ra: ", err);
    }
}


runFsDemo();
