# File: Dockerfile

# --- Giai đoạn 1: Build ---
FROM node:20-slim AS builder
WORKDIR /app

# Cài đặt các dependencies
COPY package*.json ./
RUN npm install

# Copy source code và build ứng dụng
COPY . .
RUN npm run build

# --- Giai đoạn 2: Production ---
FROM nginx:alpine

# Copy các file build từ giai đoạn builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy cấu hình nginx tùy chỉnh (nếu có)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Khởi động nginx
CMD ["nginx", "-g", "daemon off;"]