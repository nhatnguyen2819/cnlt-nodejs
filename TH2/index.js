const express = require('express');
const path = require('path');
const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'public'))); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/charts', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'charts.html'));
});
app.get('/layout-sidenav-light', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'layout-sidenav-light.html'));
});
app.get('/layout-static', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'layout-static.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'password.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/tables', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tables.html'));
});

console.log('Static path:', path.join(__dirname, 'public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});