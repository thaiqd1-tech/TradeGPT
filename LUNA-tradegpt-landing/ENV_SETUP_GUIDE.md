# Hướng dẫn tạo file .env

## 🚀 Tạo file .env trong thư mục gốc của dự án

Tạo file `.env` trong thư mục `C:\Users\user\source\react.js\d46d6c48-9f74-568f-98e7-b02748b645cc\LUNA-tradegpt-landing\` với nội dung:

```env
VITE_API_BASE_URL=https://superbai.io/api
VITE_GOOGLE_CLIENT_ID=751661411790-o290dkk1g3jdeivjqcmg5j8fa2ejn8pd.apps.googleusercontent.com
VITE_WS_URL=wss://superbai.io/ws
VITE_PAYPAL_CLIENT_ID=AQhtqAHPEzjovnQluOAY7tuUVuiiYxpXbYlXqQMdy4zFiGkdMKkk59G0pSpNBNW1I5TeKFvzWpJhv4M-
VITE_AI_SERVICE_BASE_URL=https://aiapi.superbai.io/api/v1
VITE_AI_SERVICE_SECRET_KEY=155792625553b3e0f95baf5034611266
```

## 📋 Cách tạo file .env:

### Cách 1: Sử dụng Command Prompt
```bash
# Mở Command Prompt trong thư mục dự án
cd C:\Users\user\source\react.js\d46d6c48-9f74-568f-98e7-b02748b645cc\LUNA-tradegpt-landing

# Tạo file .env
echo VITE_API_BASE_URL=https://superbai.io/api > .env
echo VITE_GOOGLE_CLIENT_ID=751661411790-o290dkk1g3jdeivjqcmg5j8fa2ejn8pd.apps.googleusercontent.com >> .env
echo VITE_WS_URL=wss://superbai.io/ws >> .env
echo VITE_PAYPAL_CLIENT_ID=AQhtqAHPEzjovnQluOAY7tuUVuiiYxpXbYlXqQMdy4zFiGkdMKkk59G0pSpNBNW1I5TeKFvzWpJhv4M- >> .env
echo VITE_AI_SERVICE_BASE_URL=https://aiapi.superbai.io/api/v1 >> .env
echo VITE_AI_SERVICE_SECRET_KEY=155792625553b3e0f95baf5034611266 >> .env
```

### Cách 2: Sử dụng Notepad
1. Mở Notepad
2. Copy nội dung trên vào Notepad
3. Save As với tên `.env` (quan trọng: phải có dấu chấm ở đầu)
4. Chọn "All Files" trong "Save as type"
5. Lưu vào thư mục gốc của dự án

### Cách 3: Sử dụng VS Code
1. Mở VS Code trong thư mục dự án
2. Tạo file mới với tên `.env`
3. Copy nội dung trên vào file
4. Save file

## ✅ Sau khi tạo file .env:

1. **Restart Vite server:**
   ```bash
   # Dừng server hiện tại (Ctrl+C)
   # Chạy lại
   npm run dev
   ```

2. **Test API connection:**
   - Truy cập: `http://localhost:5177/`
   - Click "Test API Connection" trong APITest component
   - Kiểm tra console để xem kết quả

3. **Test Login:**
   - Click "Sign In" trong Header
   - Thử đăng nhập với credentials thực tế

## 🔧 Troubleshooting:

### Nếu vẫn gặp lỗi "Failed to fetch":
- Kiểm tra file `.env` có được tạo đúng không
- Restart Vite server sau khi tạo file `.env`
- Kiểm tra network connection đến `https://superbai.io`

### Nếu API trả về lỗi 401/403:
- Có thể cần credentials thực tế từ hệ thống
- Kiểm tra API documentation của superbai.io

## 🎯 Kết quả mong đợi:

Sau khi tạo file `.env` và restart server:
- ✅ APITest sẽ kết nối được với `https://superbai.io/api`
- ✅ Login form sẽ gửi request đến API thực tế
- ✅ Không còn lỗi "ERR_CONNECTION_REFUSED"
