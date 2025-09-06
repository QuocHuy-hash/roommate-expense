# Hướng dẫn phát triển API

## Bắt đầu nhanh

### 1. Khởi động server
```bash
cd backend
npm run dev
```

Server sẽ chạy tại:
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health  
- **Swagger UI**: http://localhost:3001/api-docs

### 2. Test API cơ bản

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Đăng ký user mới
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Đăng nhập
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Lưu JWT token từ response để sử dụng cho các request tiếp theo.

#### Tạo expense (cần authentication)
```bash
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Grocery Shopping",
    "amount": "150.75",
    "description": "Weekly grocery shopping",
    "isShared": true
  }'
```

#### Lấy danh sách expenses
```bash
curl -X GET http://localhost:3001/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Workflow phát triển

### 1. Thêm endpoint mới

1. **Định nghĩa schema** trong `src/schema.ts`:
```typescript
export const newFeatureSchema = createInsertSchema(newFeatureTable).omit({
  id: true,
  createdAt: true,
});
```

2. **Tạo route handler** trong `src/routes/`:
```typescript
/**
 * @swagger
 * /api/new-feature:
 *   post:
 *     summary: Create new feature
 *     tags: [NewFeature]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNewFeatureRequest'
 *     responses:
 *       201:
 *         description: Success
 */
router.post('/', async (req: Request, res: Response) => {
  // Implementation
});
```

3. **Cập nhật Swagger schema** trong `src/swagger.ts`

4. **Thêm route vào app** trong `src/index.ts`:
```typescript
import newFeatureRoutes from './routes/newFeature.js';
app.use('/api/new-feature', newFeatureRoutes);
```

### 2. Cập nhật database schema

1. Chỉnh sửa schema trong `src/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run migrate`

### 3. Testing

Sử dụng Swagger UI để test interactively:
1. Mở http://localhost:3001/api-docs
2. Click "Authorize" để nhập JWT token
3. Test các endpoint trực tiếp

## Best Practices

### 1. Error Handling
Luôn return error response với format chuẩn:
```typescript
res.status(400).json({ 
  error: 'Error type',
  message: 'Detailed message' 
});
```

### 2. Validation
Sử dụng Zod schema để validate input:
```typescript
const validatedData = schema.parse(req.body);
```

### 3. Authentication
Thêm middleware authentication cho routes cần bảo mật:
```typescript
router.use(authenticateToken);
```

### 4. Documentation
Luôn thêm JSDoc comment cho endpoints mới:
- Mô tả rõ ràng chức năng
- Định nghĩa request/response schema
- Liệt kê các error codes có thể

## Troubleshooting

### Port đã được sử dụng
```bash
# Kill process đang dùng port 3001
lsof -ti:3001 | xargs kill -9
```

### Database connection error
1. Kiểm tra file `.env` có đúng DATABASE_URL
2. Đảm bảo database đã được setup
3. Run migration: `npm run migrate`

### Swagger không hiển thị endpoint mới
1. Restart server
2. Kiểm tra JSDoc syntax
3. Đảm bảo file route được import đúng

## Environment Variables

Tạo file `.env` trong thư mục backend:
```env
DATABASE_URL="your_database_url"
JWT_SECRET="your_jwt_secret"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
PORT=3001
```

## Database Management

### Setup ban đầu
```bash
npm run migrate
```

### Reset database
```bash
# Careful: This will delete all data
npm run db:push
```

### Generate new migration
```bash
npm run db:generate
```

## Monitoring & Logging

- Logs sẽ xuất hiện trong console khi chạy `npm run dev`
- Error messages được log chi tiết trong development mode
- Health check endpoint để monitor uptime

## Deployment

### Build for production
```bash
npm run build
npm start
```

### Environment setup
- Set `NODE_ENV=production`
- Configure production database URL
- Set secure JWT secret
- Configure CORS for production domain
