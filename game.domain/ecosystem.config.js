module.exports = {
  apps: [{
    name: "caro-realx",
    script: "./server.js",
    instances: 1, // Để 1 instance để Socket.IO chạy mượt không cần Redis adapter ban đầu
    exec_mode: "fork",
    env: {
      NODE_ENV: "development",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
