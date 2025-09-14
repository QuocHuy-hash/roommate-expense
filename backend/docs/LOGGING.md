# Request Logging System

Hệ thống backend hiện đã được tích hợp logging tự động để theo dõi tất cả các request đến server.

## Tính năng

### 🔍 Logging Cơ bản
- **Timestamp**: Thời gian chính xác của request
- **HTTP Method**: GET, POST, PUT, DELETE, etc.
- **URL Path**: Đường dẫn API được gọi
- **Response Status**: Mã trạng thái HTTP (200, 404, 500, etc.)
- **Response Time**: Thời gian xử lý request (milliseconds)

### 🔍 Logging Chi tiết (Development Mode)
- **IP Address**: Địa chỉ IP của client
- **User Agent**: Thông tin trình duyệt/client
- **Request Headers**: Headers quan trọng (authorization, content-type, etc.)
- **Request Body**: Dữ liệu POST/PUT/PATCH (ẩn thông tin nhạy cảm)
- **Query Parameters**: Các tham số URL
- **Response Size**: Kích thước response

### 📊 Thống kê Request
- Tổng số request
- Tổng số lỗi
- Tỷ lệ lỗi (error rate)
- Thời gian server chạy (uptime)

## Cấu hình

### Biến môi trường

```bash
# Tắt hoàn toàn logging
DISABLE_LOGGING=true

# Bật logging chi tiết (ngay cả trong production)
DETAILED_LOGGING=true

# Môi trường development tự động bật detailed logging
NODE_ENV=development
```

### Mặc định

- **Development**: Logging chi tiết được bật
- **Production**: Chỉ logging cơ bản
- **Thông tin nhạy cảm**: Tự động ẩn (`password`, `token`, `accessToken`, `refreshToken`)

## Ví dụ Output

### Logging Cơ bản
```
📥 [2025-01-14T10:30:45.123Z] POST /api/auth/login
📤 [2025-01-14T10:30:45.234Z] POST /api/auth/login - ✅ 200 (111ms)
────────────────────────────────────────────────────────────────────────────────
```

### Logging Chi tiết
```
📥 [2025-01-14T10:30:45.123Z] POST /api/auth/login
   📍 IP: 192.168.1.100
   🌐 User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...
   📋 content-type: application/json
   📦 Body: {
     "email": "user@example.com",
     "password": "[HIDDEN]"
   }
📤 [2025-01-14T10:30:45.234Z] POST /api/auth/login - ✅ 200 (111ms)
   📏 Response Size: 1.2 KB
────────────────────────────────────────────────────────────────────────────────
```

## API Endpoints

### `/health` - Health Check
Kiểm tra trạng thái server
```json
{
  "status": "OK",
  "timestamp": "2025-01-14T10:30:45.123Z"
}
```

### `/stats` - Thống kê Server
Xem thống kê request và thông tin server
```json
{
  "totalRequests": 1205,
  "totalErrors": 23,
  "errorRate": "1.91%",
  "uptime": 3600.5,
  "environment": "development",
  "timestamp": "2025-01-14T10:30:45.123Z"
}
```

## Status Icons

- ✅ **2xx**: Thành công
- 🔄 **3xx**: Redirect
- ⚠️ **4xx**: Lỗi client (400, 401, 404, etc.)
- ❌ **5xx**: Lỗi server (500, 502, etc.)
- ❓ **Other**: Mã status khác

## Bảo mật

- **Automatic Hiding**: Tự động ẩn các field nhạy cảm
- **Header Protection**: Authorization headers được rút gọn
- **Configurable**: Có thể tắt logging hoàn toàn nếu cần

## Tips

1. **Development**: Để detailed logging bật để debug dễ dàng
2. **Production**: Chỉ bật detailed logging khi cần thiết
3. **Monitoring**: Sử dụng `/stats` endpoint để theo dõi hiệu suất
4. **Log Analysis**: Logs có format nhất quán, dễ parse bằng tools khác

Logging system này giúp bạn theo dõi và debug API một cách hiệu quả mà không ảnh hưởng đến hiệu suất của server.