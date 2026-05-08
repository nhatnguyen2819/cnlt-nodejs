# 🎮 Caro RealX - Deploy Guide

## Yêu cầu
- Node.js >= 18
- MongoDB >= 6
- PM2 (global): `npm install -g pm2`
- Nginx

## Cài đặt local

```bash
cd caro-realx
cp .env.example .env
# Chỉnh sửa .env nếu cần
npm install
npm run seed     # Seed dữ liệu mẫu (tùy chọn)
npm run dev      # Chạy dev với nodemon
```

Mở trình duyệt: http://localhost:3000

## Deploy Production (Ubuntu 22.04)

### 1. Cài MongoDB
```bash
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Cài Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Clone và cài đặt
```bash
git clone <repo> /var/www/caro-realx
cd /var/www/caro-realx
npm install --production
cp .env.example .env
# Chỉnh MONGODB_URI, PORT trong .env
```

### 4. Chạy với PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 5. Nginx
```bash
sudo cp nginx.conf /etc/nginx/sites-available/caro-realx
sudo ln -s /etc/nginx/sites-available/caro-realx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL với Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d game.domain.com
```

## Cấu trúc thư mục
```
caro-realx/
├── server.js              # Entry point
├── ecosystem.config.js    # PM2 config
├── nginx.conf             # Nginx config mẫu
├── src/
│   ├── app.js             # Express app
│   ├── config/database.js
│   ├── controllers/       # API logic
│   ├── game/caroEngine.js # Game logic 15x15
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   └── socket/            # Socket.IO handlers
├── public/
│   ├── index.html         # Frontend SPA
│   ├── css/style.css      # Neon dark theme
│   └── js/
│       ├── game.js        # Board renderer
│       └── app.js         # App controller
└── scripts/seed.js
```

## Socket Events
| Event | Direction | Mô tả |
|-------|-----------|-------|
| register | C→S | Đăng ký tên người chơi |
| create_room | C→S | Tạo phòng mới |
| join_room | C→S | Vào phòng |
| player_move | C→S | Đánh cờ |
| surrender | C→S | Đầu hàng |
| send_message | C→S | Chat trong phòng |
| lobby_update | S→C | Cập nhật danh sách phòng |
| game_start | S→C | Bắt đầu game |
| game_state_update | S→C | Cập nhật bảng cờ |
| game_over | S→C | Kết thúc game |
| player_left | S→C | Đối thủ rời phòng |
