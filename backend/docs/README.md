# API Documentation

Thư mục này chứa tài liệu API cho RoomMate Expense Management Backend.

## Files

### 1. `api-specification.json`
File OpenAPI 3.0 specification hoàn chỉnh mô tả toàn bộ API:
- Endpoints và methods
- Request/response schemas
- Authentication requirements
- Error handling
- Examples

### 2. `API_DOCUMENTATION.md`
Tài liệu chi tiết bằng tiếng Việt bao gồm:
- Tổng quan API
- Hướng dẫn authentication
- Chi tiết từng endpoint
- Validation rules
- Error codes
- Data models
- Security considerations

### 3. `api-parameters.json`
File JSON structured mô tả chi tiết:
- Parameters cho từng endpoint
- Response format
- Authentication info
- Error codes
- cURL examples

## Truy cập Swagger UI

Khi server đang chạy, bạn có thể truy cập Swagger UI tại:
```
http://localhost:3001/api-docs
```

Swagger UI cung cấp:
- Interactive API documentation
- Try-it-out functionality
- Schema validation
- Authentication testing

## Cách sử dụng

### 1. Để xem documentation:
- Khởi động backend server: `npm run dev`
- Mở browser và truy cập: `http://localhost:3001/api-docs`

### 2. Để test API:
- Sử dụng Swagger UI để test trực tiếp
- Hoặc sử dụng curl commands từ `api-parameters.json`
- Hoặc import `api-specification.json` vào Postman

### 3. Authentication flow:
1. Đăng ký tài khoản: `POST /api/auth/register`
2. Hoặc đăng nhập: `POST /api/auth/login`
3. Lấy JWT token từ response
4. Sử dụng token trong header: `Authorization: Bearer <token>`

## Cập nhật Documentation

Khi thay đổi API:
1. Cập nhật JSDoc comments trong source code
2. Cập nhật file `swagger.ts` nếu cần
3. Restart server để thấy thay đổi trong Swagger UI
4. Cập nhật manually các file JSON và Markdown nếu cần

## Tools hỗ trợ

- **Swagger Editor**: https://editor.swagger.io/ (để edit OpenAPI spec)
- **Postman**: Import `api-specification.json` để tạo collection
- **Insomnia**: Cũng hỗ trợ import OpenAPI spec
- **VS Code Extension**: OpenAPI (Swagger) Editor extension
