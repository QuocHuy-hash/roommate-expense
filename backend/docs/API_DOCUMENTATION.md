# RoomMate Expense Management API Documentation

## Tổng quan

API RoomMate Expense Management là một hệ thống quản lý chi tiêu chung cho các bạn cùng phòng. API này cung cấp các chức năng để theo dõi chi tiêu, quản lý thanh toán và tính toán số dư giữa các thành viên.

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: TBD

## Authentication

API sử dụng JWT (JSON Web Token) để xác thực người dùng. Token được trả về sau khi đăng nhập thành công và phải được gửi kèm trong header `Authorization` với format `Bearer <token>`.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### 1. Health Check

#### GET /health
Kiểm tra trạng thái hoạt động của API.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-06T10:30:00.000Z"
}
```

---

### 2. Authentication

#### POST /api/auth/register
Đăng ký tài khoản người dùng mới.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `email`: Phải là email hợp lệ
- `password`: Tối thiểu 6 ký tự
- `firstName`: Bắt buộc, không được rỗng
- `lastName`: Bắt buộc, không được rỗng

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "error": "User already exists"
}
```

#### POST /api/auth/login
Đăng nhập vào hệ thống.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 3. Expenses Management

#### GET /api/expenses
Lấy danh sách tất cả chi tiêu (yêu cầu authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "expenses": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Grocery Shopping",
      "amount": "150.75",
      "description": "Weekly grocery shopping at supermarket",
      "payerId": "550e8400-e29b-41d4-a716-446655440000",
      "isShared": true,
      "imageUrl": "https://example.com/receipt.jpg",
      "createdAt": "2025-01-06T10:30:00.000Z",
      "updatedAt": "2025-01-06T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/expenses
Tạo khoản chi tiêu mới (yêu cầu authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Grocery Shopping",
  "amount": "150.75",
  "description": "Weekly grocery shopping",
  "isShared": true,
  "imageUrl": "https://example.com/receipt.jpg"
}
```

**Validation Rules:**
- `title`: Bắt buộc, không được rỗng
- `amount`: Bắt buộc, phải là số hợp lệ
- `description`: Tùy chọn
- `isShared`: Mặc định là `true`
- `imageUrl`: Tùy chọn

**Success Response (201):**
```json
{
  "message": "Expense created successfully",
  "expense": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Grocery Shopping",
    "amount": "150.75",
    "description": "Weekly grocery shopping",
    "payerId": "550e8400-e29b-41d4-a716-446655440000",
    "isShared": true,
    "imageUrl": "https://example.com/receipt.jpg",
    "createdAt": "2025-01-06T10:30:00.000Z",
    "updatedAt": "2025-01-06T10:30:00.000Z"
  }
}
```

#### PUT /api/expenses/:id
Cập nhật thông tin chi tiêu (yêu cầu authentication và quyền sở hữu).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: UUID của khoản chi tiêu

**Request Body:**
```json
{
  "title": "Updated Grocery Shopping",
  "amount": "175.25",
  "description": "Updated description",
  "isShared": true,
  "imageUrl": "https://example.com/new-receipt.jpg"
}
```

**Success Response (200):**
```json
{
  "message": "Expense updated successfully",
  "expense": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Updated Grocery Shopping",
    "amount": "175.25",
    "description": "Updated description",
    "payerId": "550e8400-e29b-41d4-a716-446655440000",
    "isShared": true,
    "imageUrl": "https://example.com/new-receipt.jpg",
    "createdAt": "2025-01-06T10:30:00.000Z",
    "updatedAt": "2025-01-06T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `403`: Không có quyền cập nhật chi tiêu này
- `404`: Không tìm thấy chi tiêu

#### DELETE /api/expenses/:id
Xóa khoản chi tiêu (yêu cầu authentication và quyền sở hữu).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: UUID của khoản chi tiêu

**Success Response (200):**
```json
{
  "message": "Expense deleted successfully"
}
```

**Error Responses:**
- `403`: Không có quyền xóa chi tiêu này
- `404`: Không tìm thấy chi tiêu

---

### 4. Settlements Management

#### GET /api/settlements
Lấy danh sách tất cả thanh toán (yêu cầu authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "settlements": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "payerId": "550e8400-e29b-41d4-a716-446655440000",
      "payeeId": "550e8400-e29b-41d4-a716-446655440001",
      "amount": "75.50",
      "description": "Settlement for grocery expenses",
      "imageUrl": "https://example.com/transfer-receipt.jpg",
      "createdAt": "2025-01-06T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/settlements
Tạo thanh toán mới (yêu cầu authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "payeeId": "550e8400-e29b-41d4-a716-446655440001",
  "amount": "75.50",
  "description": "Settlement for shared expenses",
  "imageUrl": "https://example.com/transfer-receipt.jpg"
}
```

**Validation Rules:**
- `payeeId`: Bắt buộc, phải là UUID hợp lệ
- `amount`: Bắt buộc, phải là số hợp lệ
- `description`: Tùy chọn
- `imageUrl`: Tùy chọn (ảnh chụp biên lai chuyển khoản)

**Success Response (201):**
```json
{
  "message": "Settlement created successfully",
  "settlement": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "payerId": "550e8400-e29b-41d4-a716-446655440000",
    "payeeId": "550e8400-e29b-41d4-a716-446655440001",
    "amount": "75.50",
    "description": "Settlement for shared expenses",
    "imageUrl": "https://example.com/transfer-receipt.jpg",
    "createdAt": "2025-01-06T10:30:00.000Z"
  }
}
```

---

## Error Handling

API sử dụng các HTTP status code chuẩn để chỉ ra kết quả của request:

- `200 OK`: Request thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Dữ liệu request không hợp lệ
- `401 Unauthorized`: Chưa xác thực hoặc token không hợp lệ
- `403 Forbidden`: Không có quyền thực hiện hành động
- `404 Not Found`: Không tìm thấy resource
- `500 Internal Server Error`: Lỗi server

**Error Response Format:**
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Data Models

### User
```typescript
{
  id: string;           // UUID
  email: string;        // Email address
  firstName: string;    // First name
  lastName: string;     // Last name
  profileImageUrl?: string; // Profile image URL (optional)
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Expense
```typescript
{
  id: string;           // UUID
  title: string;        // Expense title
  amount: string;       // Amount (decimal as string)
  description?: string; // Description (optional)
  payerId: string;      // UUID of the user who paid
  isShared: boolean;    // Whether expense is shared
  imageUrl?: string;    // Receipt image URL (optional)
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Settlement
```typescript
{
  id: string;           // UUID
  payerId: string;      // UUID of the user who made payment
  payeeId: string;      // UUID of the user who received payment
  amount: string;       // Amount (decimal as string)
  description?: string; // Description (optional)
  imageUrl?: string;    // Transfer receipt image URL (optional)
  createdAt: Date;      // Creation timestamp
}
```

## Security Considerations

1. **Authentication**: Tất cả endpoints (trừ health check và auth) yêu cầu JWT token
2. **Authorization**: Chỉ có người tạo chi tiêu mới có thể cập nhật/xóa chi tiêu đó
3. **Input Validation**: Tất cả input đều được validate bằng Zod schema
4. **Password Security**: Password được hash bằng bcrypt trước khi lưu vào database
5. **CORS**: Được cấu hình để chỉ cho phép origin từ frontend

## Rate Limiting

Hiện tại chưa có rate limiting. Nên implement trong production environment.

## Logging

API logs các error và request quan trọng. Trong development mode, error message chi tiết sẽ được trả về.
