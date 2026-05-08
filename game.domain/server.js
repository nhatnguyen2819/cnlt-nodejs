require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const initSocket = require('./src/socket');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
