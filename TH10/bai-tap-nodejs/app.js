const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình session
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Dữ liệu mẫu (Bài 1)
let students = [
  { id: 1, name: "Nguyen Van A", email: "a@gmail.com" },
  { id: 2, name: "Tran Thi B", email: "b@gmail.com" }
];

// ========== ROOT ROUTE ==========
app.get('/', (req, res) => {
  res.json({
    message: 'Server Node.js đang chạy!',
    routes: [
      'GET  /students          - Danh sách sinh viên (có phân trang)',
      'GET  /students/search   - Tìm kiếm theo tên (?name=...)',
      'GET  /students/:id      - Chi tiết sinh viên',
      'POST /students          - Thêm sinh viên',
      'PUT  /students/:id      - Cập nhật sinh viên',
      'DELETE /students/:id    - Xóa sinh viên',
      'GET  /sync              - Đọc file đồng bộ (blocking)',
      'GET  /async             - Đọc file bất đồng bộ (non-blocking)',
      'POST /login             - Đăng nhập (username: admin, password: 123456)',
      'GET  /profile           - Thông tin người dùng (cần đăng nhập)',
      'GET  /logout            - Đăng xuất',
    ]
  });
});

// ========== BÀI 1: QUẢN LÝ SINH VIÊN ==========

// Tìm kiếm sinh viên
app.get('/students/search', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: 'Thiếu tham số name' });
  const result = students.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
  res.json(result);
});

// Lấy danh sách + Phân trang
app.get('/students', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || students.length;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const result = students.slice(startIndex, endIndex);
  res.status(200).json(result);
});

// Lấy chi tiết sinh viên
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id == req.params.id);
  if (!student) return res.status(404).json({ message: 'Không tìm thấy' });
  res.status(200).json(student);
});

// Thêm sinh viên
app.post('/students', (req, res) => {
  const { name, email } = req.body;

  if (!name || name.length < 2) {
    return res.status(400).json({ message: 'Tên không rỗng và >= 2 ký tự' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || students.some(s => s.email === email)) {
    return res.status(400).json({ message: 'Email sai định dạng hoặc bị trùng' });
  }

  const newStudent = { id: students.length + 1, name, email };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// Cập nhật sinh viên
app.put('/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy' });
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

// Xóa sinh viên
app.delete('/students/:id', (req, res) => {
  students = students.filter(s => s.id != req.params.id);
  res.status(200).json({ message: 'Đã xóa' });
});

// ========== BÀI 2: BLOCKING VS NON-BLOCKING ==========

// Tạo file test.txt nếu chưa có
const testFilePath = path.join(__dirname, 'test.txt');
if (!fs.existsSync(testFilePath)) {
  fs.writeFileSync(testFilePath, 'Hello, this is a test file for Node.js blocking/non-blocking demo.');
}

// Đồng bộ (Blocking)
app.get('/sync', (req, res) => {
  console.log('Bắt đầu đọc file sync...');
  const data = fs.readFileSync(testFilePath, 'utf8');
  console.log('Đã đọc xong sync.');
  res.send(data);
});

// Bất đồng bộ (Non-blocking)
app.get('/async', (req, res) => {
  console.log('Bắt đầu đọc file async...');
  fs.readFile(testFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi đọc file' });
    console.log('Đã đọc xong async.');
    res.send(data);
  });
  console.log('Lệnh sau readFile (chạy trước khi đọc xong)');
});

// ========== BÀI 3: SESSION ==========

// Middleware kiểm tra đăng nhập
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập' });
  }
  next();
}

// GET /login - Trả về form đăng nhập
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Đăng nhập</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
        .box { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 320px; }
        h2 { text-align: center; margin-bottom: 1.5rem; color: #333; }
        input { width: 100%; padding: 10px; margin-bottom: 1rem; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 14px; }
        button { width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
        button:hover { background: #45a049; }
        #msg { text-align: center; margin-top: 1rem; color: red; }
      </style>
    </head>
    <body>
      <div class="box">
        <h2>🔐 Đăng nhập</h2>
        <input type="text" id="username" placeholder="Tên đăng nhập" />
        <input type="password" id="password" placeholder="Mật khẩu" />
        <button onclick="login()">Đăng nhập</button>
        <div id="msg"></div>
      </div>
      <script>
        async function login() {
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          const msg = document.getElementById('msg');
          if (res.ok) {
            msg.style.color = 'green';
            msg.textContent = data.message + ' ✅';
            setTimeout(() => window.location.href = '/profile', 1000);
          } else {
            msg.style.color = 'red';
            msg.textContent = data.message + ' ❌';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123456') {
    req.session.user = username;
    return res.status(200).json({ message: 'Đăng nhập thành công' });
  }
  res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });
});

// GET /profile (yêu cầu đăng nhập)
app.get('/profile', requireLogin, (req, res) => {
  res.status(200).json({ user: req.session.user });
});

// GET /logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Không thể đăng xuất' });
    res.status(200).json({ message: 'Đã đăng xuất' });
  });
});

// ========== Khởi động server ==========
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});