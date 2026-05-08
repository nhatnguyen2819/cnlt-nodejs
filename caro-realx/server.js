require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/socket');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
initSocket(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🎮 Caro RealX running on http://localhost:${PORT}`);
  });
});
