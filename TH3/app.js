const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// Dữ liệu mẫu lấy từ nội dung trang https://www.duongchitrung.studio/
// Mảng này có 5 phần tử, mỗi phần tử là một "mốc" trong hành trình (Kinh nghiệm / Công bố)
const experiences = [
  {
    id: 1,
    title: 'AI Engineer tại BlueBolt Software',
    period: '01/2026 - Nay',
    description: 'Thiết kế pipeline computer vision dựa trên YOLO để phát hiện góc thẻ bài trong thời gian thực. Tối ưu hóa huấn luyện và triển khai trên môi trường GPU, đảm bảo độ chính xác 100% trong điều kiện thực tế.',
    organization: 'BlueBolt Software, Vietnam',
    hot: true
  },
  {
    id: 2,
    title: 'AI Research Internship',
    period: 'Trong quá trình học',
    description: 'Nghiên cứu về tái tạo lưới cơ thể người 3D từ ảnh đơn (3D Human Mesh Reconstruction) sử dụng diffusion methods. Đề xuất kiến trúc ScoreNet-X giúp giảm 80% kích thước mô hình, cải thiện 3-4% độ chính xác trên bộ dữ liệu H36M và 3DPW.',
    organization: 'Nghiên cứu dưới sự hướng dẫn của Professor Wen-Nung Lie',
    hot: true
  },
  {
    id: 3,
    title: 'Brain Research Consultants',
    period: 'Đã qua',
    description: 'Phát triển các mô hình Alpha dự đoán biến động giá thị trường chứng khoán. Thực hiện phân tích thống kê bằng kiểm định giả thuyết và tự động hóa các tác vụ lặp lại bằng lập trình.',
    organization: 'Brain Research Consultants',
    hot: false
  },
  {
    id: 4,
    title: 'Công bố: Multidimensional Vector Ranking Algorithm',
    period: '2025',
    description: 'Đề xuất thuật toán xếp hạng vector đa chiều dựa trên ReLU cho hệ thống gợi ý nhóm. Công trình được đăng tại hội nghị ICCCI 2025, nhà xuất bản Springer CCIS.',
    organization: 'International Conference on Computational Collective Intelligence',
    hot: true
  },
  {
    id: 5,
    title: 'Công bố: Deep Learning cho Drug-Target Interactions',
    period: '2025',
    description: 'Phát triển mô hình học sâu kết hợp LSTM và Attention để dự đoán ái lực liên kết thuốc-protein từ chuỗi SMILES và amino acid, vượt trội so với các baseline CNN trên bộ dữ liệu KIBA.',
    organization: 'International Symposium on Information and Communication Technology (SOICT 2025)',
    hot: false
  }
];

// Route trang chủ (Giới thiệu bản thân)
app.get('/', (req, res) => {
  // Lấy 3 kinh nghiệm nổi bật nhất (hot) để hiển thị
  const featuredExperiences = experiences.filter(exp => exp.hot).slice(0, 3);
  res.render('index', {
    title: 'Nguyễn Nhất Nguyên - Hành trình Khoa học Dữ liệu',
    featuredExperiences: featuredExperiences
  });
});

// Route trang danh sách (Toàn bộ hành trình)
app.get('/list', (req, res) => {
  res.render('list', {
    title: 'Hành trình & Kinh nghiệm',
    experiences: experiences
  });
});

// Route trang liên hệ
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Liên hệ với tôi' });
});

// Route động xem chi tiết một cột mốc
app.get('/detail/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const experience = experiences.find(exp => exp.id === id);
  if (!experience) {
    return res.status(404).send('Không tìm thấy cột mốc trong hành trình');
  }
  res.render('detail', {
    title: experience.title,
    experience: experience
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});