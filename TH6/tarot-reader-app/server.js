const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Transform } = require('stream');

// Custom Event and Streams
const TarotEmitter = require('./events/TarotEmitter');
const MysticalTransform = require('./streams/MysticalTransform');
const EchoDuplex = require('./streams/EchoDuplex');

const app = express();
const port = 3000;

// Instantiate the custom Event Emitter
const tarotEvents = new TarotEmitter();

// Middleware to parse URL-encoded bodies and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes for views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'events.html'));
});

app.get('/request', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'request.html'));
});

app.get('/streams', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'streams.html'));
});

app.get('/xem-tarot', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'xem-tarot.html'));
});

app.get('/blogs', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'blogs.html'));
});

app.get('/download-log', (req, res) => {
  const logPath = path.join(__dirname, 'public', 'data', 'log.txt');
  
  if (!fs.existsSync(logPath)) {
    return res.status(404).send('Log file not found.');
  }

  // Force file download rather than just viewing in browser
  res.setHeader('Content-disposition', 'attachment; filename=tarot-log.txt');
  res.setHeader('Content-type', 'text/plain');

  const fileStream = fs.createReadStream(logPath);
  
  // Stream data directly to the client
  fileStream.pipe(res);
  
  fileStream.on('error', (err) => {
    console.error("Error reading log file:", err);
    if (!res.headersSent) {
      res.status(500).send("Error downloading file.");
    }
  });
});

// POST route providing HTTP Request parsing, Streams, and Events
app.post('/api/read', (req, res) => {
  // 1. Request and Header features
  console.log('\n--- Incoming Tarot Reading Request ---');
  console.log(`Method: ${req.method}`);
  console.log(`Content-Type: ${req.headers['content-type']}`);
  console.log(`User-Agent: ${req.headers['user-agent']}`);
  
  const { name, question } = req.body;
  if (!name || !question) {
    return res.status(400).send("Name and question are required.");
  }

  // 2. Event-driven
  tarotEvents.drawCard(`A mystic card drawn for visitor ${name}`);
  
  // 3. Streams (Readable, Transform, Writable, Duplex)
  const sourcePath = path.join(__dirname, 'public', 'data', 'meanings.txt');
  const logPath = path.join(__dirname, 'public', 'data', 'log.txt');
  
  // If meanings.txt does not exist, let's create a stub
  if (!fs.existsSync(sourcePath)) {
     fs.writeFileSync(sourcePath, "The Fool: New beginnings\nThe Magician: Manifestation\n");
  }

  // Readable Stream
  const readableStream = fs.createReadStream(sourcePath, { encoding: 'utf8' });
  // Writable Stream
  const writableStream = fs.createWriteStream(logPath, { flags: 'a' });
  
  writableStream.write(`\n--- Reading for ${name} at ${new Date().toISOString()} ---\nQuestion: ${question}\n`);

  // We convert text chunks to Objects because MysticalTransform handles objectMode: true
  const textToObjectTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      this.push({ textContent: chunk.toString() });
      callback();
    }
  });

  const stringifyStream = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      callback(null, JSON.stringify(chunk) + '\n');
    }
  });

  const mysticalTransform = new MysticalTransform();
  const echoDuplex = new EchoDuplex();

  // Stream Pipeline: Readable -> Transform -> Transform(Custom) -> Duplex(Custom) -> Transform -> Writable
  readableStream
    .pipe(textToObjectTransform)
    .pipe(mysticalTransform)
    .pipe(echoDuplex)
    .pipe(stringifyStream)
    .pipe(writableStream);

  writableStream.on('finish', () => {
    // Event trigger upon completion
    tarotEvents.completeReading(`Successfully logged the reading for ${name}`);
    
    // Respond to client
    res.send(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kết quả bói bài</title>
          <link rel="stylesheet" href="/style.css">
      </head>
      <body>
          <div class="page-container">
              <h1>Tín Hiệu Vũ Trụ Đã Được Ghi Nhận</h1>
              <div class="results-box">
                  <p>Cảm ơn <strong>${name}</strong>.</p>
                  <p>Câu hỏi của bạn: "${question}"</p>
                  <hr style="border-color: #333; margin: 15px 0" />
                  <p style="font-size: 13px; color: #a0a0a0;">* Dữ liệu đã được hệ thống truyền thành công qua Readable Stream, xử lý bởi MysticalTransform (Transform), lưu trữ với EchoDuplex (Duplex), và ghi vào tệp nhật ký (Writable) cùng với Headers của bạn.</p>
              </div>
              <a href="/" class="btn-primary" style="margin-top: 30px;">QUAY LẠI TRANG CHỦ</a>
          </div>
      </body>
      </html>
    `);
  });

  readableStream.on('error', (err) => {
    console.error("Stream Error:", err);
    res.status(500).send("A mystical interference occurred.");
  });
});

// Explicitly define HTTP server to satisfy the backend requirement
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Mystical Tarot Server running at http://localhost:${port}`);
});