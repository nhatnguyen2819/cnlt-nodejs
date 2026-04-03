const BlogPost = require('../models/BlogPost');

exports.index = async (req, res) => {
  try {
    const posts = await BlogPost.find({}).sort({ createdAt: -1 });
    res.render('blogposts', { title: 'Danh sách bài viết', posts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi lấy danh sách bài viết');
  }
};

exports.createForm = (req, res) => {
  res.render('create', { title: 'Tạo bài viết mới' });
};

exports.store = async (req, res) => {
  try {
    await BlogPost.create({
      title: req.body.title,
      body: req.body.body,
      image: req.file ? req.file.filename : null,
    });
    res.redirect('/blogposts');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi lưu bài viết');
  }
};

exports.show = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }
    res.render('blogpost_detail', { title: post.title, post });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi server');
  }
};

exports.editForm = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }
    res.render('edit', { title: 'Sửa bài viết', post });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi server');
  }
};

exports.update = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Không tìm thấy bài viết');
    }
    post.title = req.body.title;
    post.body = req.body.body;
    if (req.file) {
      post.image = req.file.filename;
    }
    post.updatedAt = Date.now();
    await post.save();
    res.redirect('/blogposts');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi cập nhật');
  }
};

exports.delete = async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect('/blogposts');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi xóa bài viết');
  }
};
