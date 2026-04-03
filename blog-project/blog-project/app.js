const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Kết nối MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
  .then(() => console.log('✓ Kết nối MongoDB thành công'))
  .catch((error) => console.log('✗ Lỗi kết nối MongoDB:', error));

// ROUTE: Trang chủ - hiển thị danh sách bài viết
app.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({}).sort({ createdAt: -1 });
    res.render('index', { posts });
  } catch (error) {
    console.log('Lỗi:', error);
    res.status(500).send('Lỗi server');
  }
});

// ROUTE: Hiển thị form tạo bài viết mới
app.get('/blogposts/new', (req, res) => {
  res.render('create');
});

// ROUTE: Lưu bài viết vào MongoDB
app.post('/blogposts/store', async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).send('Vui lòng nhập tiêu đề và nội dung');
    }

    await BlogPost.create({
      title: title,
      body: body
    });
    
    console.log('✓ Bài viết được lưu thành công');
    res.redirect('/');
  } catch (error) {
    console.log('Lỗi khi lưu bài viết:', error);
    res.status(500).send('Lỗi khi lưu bài viết');
  }
});

// ROUTE: Xem chi tiết một bài viết
app.get('/blogposts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }
    
    res.render('detail', { post });
  } catch (error) {
    console.log('Lỗi:', error);
    res.status(500).send('Lỗi server');
  }
});

// ROUTE: Hiển thị form chỉnh sửa bài viết
app.get('/blogposts/:id/edit', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }
    
    res.render('edit', { post });
  } catch (error) {
    console.log('Lỗi:', error);
    res.status(500).send('Lỗi server');
  }
});

// ROUTE: Cập nhật bài viết
app.post('/blogposts/:id/update', async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).send('Vui lòng nhập tiêu đề và nội dung');
    }

    await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        title: title,
        body: body,
        updatedAt: Date.now()
      }
    );
    
    console.log('✓ Bài viết được cập nhật thành công');
    res.redirect(`/blogposts/${req.params.id}`);
  } catch (error) {
    console.log('Lỗi khi cập nhật bài viết:', error);
    res.status(500).send('Lỗi khi cập nhật bài viết');
  }
});

// ROUTE: Xóa bài viết
app.post('/blogposts/:id/delete', async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    console.log('✓ Bài viết được xóa thành công');
    res.redirect('/');
  } catch (error) {
    console.log('Lỗi khi xóa bài viết:', error);
    res.status(500).send('Lỗi khi xóa bài viết');
  }
});

// Khởi động server
app.listen(3000, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Server đang chạy tại http://localhost:3000');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
