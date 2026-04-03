# 📝 Blog Cơ Bản với Node.js + MongoDB

Đây là một ứng dụng blog hoàn chỉnh được xây dựng bằng **Node.js**, **Express**, **MongoDB** và **Mongoose**, kèm theo **CSS** hiện đại.

## 📋 Tính năng

✅ **Tính năng cơ bản (yêu cầu)**
- Kết nối Node.js với MongoDB bằng Mongoose
- Tạo model bài viết Blog
- Thêm bài viết mới
- Xem danh sách bài viết
- Xem chi tiết một bài viết

✨ **Tính năng bổ sung (làm thêm)**
- 🎨 **CSS đẹp mắt** - Giao diện hiện đại, responsive
- ✏️ **Chỉnh sửa bài viết** - Cập nhật nội dung bài viết
- 🗑️ **Xóa bài viết** - Xóa bài viết khỏi database
- 📅 **Sắp xếp tự động** - Bài mới nhất hiển thị lên trên
- 🔍 **Xác nhận xóa** - Popup xác nhận trước khi xóa bài
- 📱 **Responsive Design** - Hoạt động tốt trên mobile và desktop

## 🛠️ Yêu cầu hệ thống

- Node.js (v14 hoặc cao hơn)
- MongoDB (đang chạy trên localhost:27017)
- npm hoặc yarn

## 📦 Cài đặt

### 1. Clone hoặc tải dự án
```bash
cd blog-project
```

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
```

Các gói sẽ được cài:
- `express` - Web framework
- `mongoose` - ODM cho MongoDB
- `ejs` - Template engine

### 3. Đảm bảo MongoDB đang chạy
```bash
# Trên Windows (nếu MongoDB đã cài)
mongod

# Hoặc kiểm tra MongoDB đang chạy
# MongoDB mặc định chạy trên: mongodb://127.0.0.1:27017
```

### 4. Chạy ứng dụng
```bash
npm start
```

Hoặc dùng nodemon để tự động reload:
```bash
npm install -g nodemon
npm run dev
```

Server sẽ khởi động tại: **http://localhost:3000**

## 📂 Cấu trúc dự án

```
blog-project/
├── app.js                 # Server chính
├── package.json          # Cấu hình npm
├── models/
│   └── BlogPost.js       # Model MongoDB
├── views/
│   ├── index.ejs         # Trang chủ (danh sách bài viết)
│   ├── create.ejs        # Form tạo bài viết
│   ├── detail.ejs        # Trang chi tiết bài viết
│   └── edit.ejs          # Form chỉnh sửa bài viết
└── public/
    └── style.css         # Tệp CSS toàn cục
```

## 🎯 Hướng dẫn sử dụng

### 1. Trang chủ
- **Địa chỉ:** `http://localhost:3000/`
- Hiển thị danh sách tất cả bài viết
- Bài viết mới nhất hiển thị lên trên
- Mỗi bài viết hiển thị:
  - Tiêu đề
  - Ngày đăng
  - Preview 150 ký tự đầu tiên
  - Nút "Đọc tiếp"

### 2. Tạo bài viết mới
- **Địa chỉ:** `http://localhost:3000/blogposts/new`
- Nhập tiêu đề và nội dung
- Bấm nút "Lưu bài viết"
- Tự động quay lại trang chủ

### 3. Xem chi tiết bài viết
- **Địa chỉ:** `http://localhost:3000/blogposts/:id`
- Hiển thị nội dung đầy đủ
- Hiển thị ngày tạo và ngày cập nhật
- Nút chỉnh sửa và xóa

### 4. Chỉnh sửa bài viết
- **Địa chỉ:** `http://localhost:3000/blogposts/:id/edit`
- Sửa tiêu đề và nội dung
- Bấm "Lưu thay đổi"

### 5. Xóa bài viết
- Bấm nút "Xóa" trên trang chi tiết
- Xác nhận xóa trong popup
- Tự động quay lại trang chủ

## 🗄️ Cấu trúc Database

### Database
```
blogDB
```

### Collection
```
blogposts
```

### Document (Document mẫu)
```json
{
  "_id": ObjectId("..."),
  "title": "Học MongoDB cơ bản",
  "body": "MongoDB là cơ sở dữ liệu NoSQL lưu theo document",
  "createdAt": ISODate("2024-01-20T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-20T10:30:00.000Z")
}
```

## 🔄 Luồng dữ liệu

```
1. Người dùng truy cập form tạo bài viết
                    ↓
2. Nhập tiêu đề và nội dung
                    ↓
3. Gửi form (POST /blogposts/store)
                    ↓
4. Server nhận dữ liệu (req.body)
                    ↓
5. Lưu vào MongoDB (BlogPost.create())
                    ↓
6. Redirect trang chủ (/)
                    ↓
7. Load danh sách bài (BlogPost.find())
                    ↓
8. Render giao diện (res.render())
                    ↓
9. Hiển thị trên trình duyệt
```

## 🚀 Routes (Đường dẫn)

| Method | Route | Chức năng |
|--------|-------|----------|
| GET | `/` | Hiển thị trang chủ |
| GET | `/blogposts/new` | Hiển thị form tạo bài |
| POST | `/blogposts/store` | Lưu bài viết |
| GET | `/blogposts/:id` | Xem chi tiết bài viết |
| GET | `/blogposts/:id/edit` | Hiển thị form chỉnh sửa |
| POST | `/blogposts/:id/update` | Cập nhật bài viết |
| POST | `/blogposts/:id/delete` | Xóa bài viết |

## 📸 Chụp ảnh kết quả

Theo yêu cầu, cần chụp ảnh các trang sau:
1. Trang chủ: `http://localhost:3000/`
2. Form tạo bài: `http://localhost:3000/blogposts/new`
3. Trang chi tiết: `http://localhost:3000/blogposts/:id` (sau khi tạo bài)

## 🐛 Xử lý lỗi

### Lỗi: "Cannot find module 'mongoose'"
```bash
npm install mongoose
```

### Lỗi: "Kết nối MongoDB thất bại"
- Kiểm tra MongoDB có đang chạy
- Kiểm tra cổng 27017 có mở không
- Kiểm tra connection string trong app.js

### Lỗi: "Cannot POST /blogposts/store"
- Kiểm tra method của form có phải POST không
- Kiểm tra action của form có đúng không
- Kiểm tra middleware `express.urlencoded` có được thêm không

## 📝 Ghi chú

- Bài viết được sắp xếp theo thứ tự mới nhất lên trước (`createdAt: -1`)
- _id tự động được MongoDB tạo
- createdAt và updatedAt tự động được thiết lập
- Tất cả input đều có validation cơ bản

## 🎓 Kiến thức học được

✓ Kết nối Node.js với MongoDB bằng Mongoose  
✓ Tạo Schema và Model cho MongoDB  
✓ Thực hiện CRUD operations (Create, Read, Update, Delete)  
✓ Sử dụng EJS để render template động  
✓ Xử lý form POST trong Express  
✓ Thiết kế CSS responsive  
✓ Routing trong Express  

## 📚 Tài liệu tham khảo

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [EJS Documentation](https://ejs.co/)

## 👤 Tác giả

Bài thực hành môn học: Xây dựng Blog cơ bản với Node.js + MongoDB

## 📄 License

Tự do sử dụng cho mục đích học tập.

---

**Chúc bạn học tập vui vẻ! 🎉**
