const express = require('express');
const path = require('path');

const connectDB = require('./db/connection');
const pageRoutes = require('./routes/pageRoutes');
const blogPostRoutes = require('./routes/blogPostRoutes');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', pageRoutes);
app.use('/blogposts', blogPostRoutes);

// Start
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
});

