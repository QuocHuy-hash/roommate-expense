# Chi Tiêu Dung - Expense Management App

Ứng dụng quản lý chi tiêu chung cho roommates, bạn bè và gia đình.

## 📋 Tổng quan

Dự án được tách thành 2 phần riêng biệt:
- **Backend**: API Server (Node.js + Express + PostgreSQL)
- **Frontend**: Web App (React + Vite + TailwindCSS)

## 🚀 Setup Instructions

### Yêu cầu hệ thống
- Node.js 18+ 
- PostgreSQL database
- npm hoặc yarn

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Cập nhật file `.env` với thông tin database và JWT secret:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/chitieudung
JWT_SECRET=your-super-secret-jwt-key-here
```

Tạo database schema:
```bash
npm run db:push
```

Chạy development server:
```bash
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend  
npm install
cp .env.example .env
```

Chạy development server:
```bash
npm run dev
```

### 3. Chạy từ Root (Optional)

Từ thư mục gốc, bạn có thể chạy cả hai cùng lúc:

```bash
# Install dependencies cho cả hai
npm install
cd backend && npm install && cd ../frontend && npm install && cd ..

# Chạy cả backend và frontend
npm run dev
```

## 📁 Cấu trúc dự án

```
├── backend/                 # API Server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   ├── schema.ts       # Database schema
│   │   ├── db.ts          # Database connection
│   │   └── index.ts       # Main server file
│   ├── package.json
│   └── drizzle.config.ts
│
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities & API client
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🛠 Công nghệ sử dụng

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Development**: TypeScript, tsx

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: TanStack Query
- **Routing**: Wouter
- **UI Components**: Radix UI
- **Forms**: React Hook Form
- **HTTP Client**: Axios

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Expenses
- `GET /api/expenses` - Lấy danh sách chi tiêu
- `POST /api/expenses` - Tạo chi tiêu mới
- `PUT /api/expenses/:id` - Cập nhật chi tiêu
- `DELETE /api/expenses/:id` - Xóa chi tiêu

### Settlements
- `GET /api/settlements` - Lấy danh sách thanh toán
- `POST /api/settlements` - Tạo thanh toán mới

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run db:push    # Push database schema
```

### Frontend Development
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run linting
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Build the application: `npm run build`
3. Start the server: `npm run start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME="Chi Tiêu Dung"
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
