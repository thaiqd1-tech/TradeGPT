# 🚀 Hướng dẫn Test Đăng nhập với Server Thực

## ✅ Cấu hình hiện tại

Dự án đã được cấu hình để kết nối với server thực:
- **API Base URL:** `https://superbai.io/api`
- **Frontend:** `http://localhost:3001/` (hoặc port khác)

## 🔧 Bước 1: Tạo file .env

Tạo file `.env` trong thư mục gốc của dự án với nội dung:

```env
VITE_API_BASE_URL="https://superbai.io/api"
VITE_GOOGLE_CLIENT_ID="751661411790-o290dkk1g3jdeivjqcmg5j8fa2ejn8pd.apps.googleusercontent.com"
VITE_WS_URL="wss://superbai.io/ws"
VITE_PAYPAL_CLIENT_ID="AQhtqAHPEzjovnQluOAY7tuUVuiiYxpXbYlXqQMdy4zFiGkdMKkk59G0pSpNBNW1I5TeKFvzWpJhv4M-"
VITE_AI_SERVICE_BASE_URL="https://aiapi.superbai.io/api/v1"
VITE_AI_SERVICE_SECRET_KEY="155792625553b3e0f95baf5034611266"
```

## 🎯 Bước 2: Test Đăng nhập

### 1. Truy cập trang web:
```
http://localhost:5173/
```

### 2. Click "Sign In" trong Header

### 3. Nhập thông tin đăng nhập:
- **Email:** Nhập email thực của bạn
- **Password:** Nhập mật khẩu thực của bạn

### 4. Click "Sign In"

## 🔍 Debug và Troubleshooting

### Kiểm tra Console:
Mở Developer Tools (F12) và xem tab Console để thấy:
- ✅ `AuthService: Attempting login to: https://superbai.io/api/auth/login`
- ✅ `AuthService: Response status: 200` (nếu thành công)
- ❌ `AuthService: Login error: ...` (nếu có lỗi)

### Kiểm tra Network:
Trong Developer Tools, tab Network:
- ✅ Request đến `https://superbai.io/api/auth/login`
- ✅ Response status 200 với access_token

### Lỗi thường gặp:

#### 1. **CORS Error:**
```
Access to fetch at 'https://superbai.io/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Giải pháp:** Server cần cấu hình CORS để cho phép localhost

#### 2. **401 Unauthorized:**
```
AuthService: Response status: 401
```
**Giải pháp:** Kiểm tra email/password có đúng không

#### 3. **Network Error:**
```
AuthService: Login error: TypeError: Failed to fetch
```
**Giải pháp:** Kiểm tra kết nối internet và server có hoạt động không

## 🧪 Test với APITest Component

Trong trang HomePage, có component `APITest` để test kết nối API:

1. **Click "Test API Connection"**
2. **Xem kết quả:**
   - ✅ **Success:** Server hoạt động bình thường
   - ❌ **Error:** Có vấn đề với server hoặc CORS

## 📋 API Endpoints được test:

| Method | Endpoint | Mục đích |
|--------|----------|----------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký |
| POST | `/auth/google/token` | Google Login |
| POST | `/auth/refresh` | Refresh Token |
| POST | `/auth/logout` | Đăng xuất |

## 🎉 Kết quả mong đợi

Khi đăng nhập thành công:
1. ✅ Modal đóng lại
2. ✅ Redirect đến `/dashboard`
3. ✅ Hiển thị Dashboard với Sidebar và Header
4. ✅ User data được lưu trong localStorage

## 🔧 Nếu vẫn gặp lỗi

Hãy chia sẻ:
1. **Console logs** từ Developer Tools
2. **Network tab** response
3. **Error message** cụ thể

Tôi sẽ giúp bạn debug tiếp!
