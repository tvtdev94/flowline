# 🚂 Hướng Dẫn Deploy Flowline lên Railway

## 📋 Tổng Quan

Railway sẽ tự động detect và build project của bạn sử dụng Dockerfile. Bạn sẽ cần tạo 3 services riêng biệt:
1. **PostgreSQL Database** (Railway cung cấp sẵn)
2. **Backend API** (.NET Core)
3. **Frontend** (React + Nginx)

---

## 🎯 Bước 1: Chuẩn Bị

### 1.1 Tạo tài khoản Railway
1. Truy cập: https://railway.app/
2. Đăng nhập bằng GitHub
3. Verify email của bạn

### 1.2 Cài đặt Railway CLI (Optional nhưng khuyên dùng)
```bash
# Linux/macOS
curl -fsSL https://railway.app/install.sh | sh

# Hoặc dùng npm
npm i -g @railway/cli

# Login
railway login
```

---

## 🚀 Bước 2: Deploy Database

### 2.1 Tạo PostgreSQL Database
1. Vào Railway Dashboard: https://railway.app/dashboard
2. Click **"New Project"**
3. Chọn **"Provision PostgreSQL"**
4. Database sẽ tự động khởi tạo

### 2.2 Lấy Database Credentials
1. Click vào PostgreSQL service
2. Vào tab **"Variables"**
3. Copy các biến sau:
   - `DATABASE_URL` (Railway tự generate)
   - Hoặc copy từng field: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

---

## 🔧 Bước 3: Deploy Backend

### 3.1 Tạo Backend Service

#### Cách 1: Qua Railway Dashboard (Dễ nhất)
1. Trong project vừa tạo, click **"New Service"**
2. Chọn **"GitHub Repo"**
3. Chọn repository **flowline**
4. Railway sẽ tự động detect Dockerfile

#### Cách 2: Qua Railway CLI
```bash
# Từ thư mục root của project
cd backend
railway init
railway up
```

### 3.2 Config Backend Service

1. Click vào Backend service
2. Vào tab **"Settings"**:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`

3. Vào tab **"Variables"** và thêm:

```bash
# Database Connection (lấy từ PostgreSQL service)
ConnectionStrings__DefaultConnection=Host=${{Postgres.PGHOST}};Port=${{Postgres.PGPORT}};Database=${{Postgres.PGDATABASE}};Username=${{Postgres.PGUSER}};Password=${{Postgres.PGPASSWORD}}

# Google OAuth (lấy từ Google Cloud Console)
Google__ClientId=your-google-client-id.apps.googleusercontent.com
Google__ClientSecret=your-google-client-secret

# JWT Configuration
JWT_SECRET=<generate-secure-32-char-string>
Jwt__Secret=${{JWT_SECRET}}
Jwt__Issuer=flowline-api
Jwt__Audience=flowline-app
Jwt__ExpiryMinutes=60

# Environment
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000

# Development Mode (set false for production)
Development__EnableGoogleAuth=true

# Port (Railway tự động expose)
PORT=5000
```

**Cách generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 3.3 Setup Networking
1. Vào tab **"Settings"** > **"Networking"**
2. Click **"Generate Domain"**
3. Copy URL (ví dụ: `https://flowline-backend-production.up.railway.app`)
4. Lưu lại để dùng cho frontend

---

## 🎨 Bước 4: Deploy Frontend

### 4.1 Update API URL cho Frontend

Trước khi deploy frontend, bạn cần update API URL:

1. Sửa file `frontend/src/services/api.ts` hoặc config tương tự:
```typescript
// Thay đổi baseURL thành Railway backend URL
const API_URL = import.meta.env.VITE_API_URL || 'https://flowline-backend-production.up.railway.app';
```

2. Hoặc tạo file `frontend/.env.production`:
```bash
VITE_API_URL=https://flowline-backend-production.up.railway.app
```

### 4.2 Tạo Frontend Service

1. Trong project, click **"New Service"**
2. Chọn **"GitHub Repo"**
3. Chọn repository **flowline**

### 4.3 Config Frontend Service

1. Click vào Frontend service
2. Vào tab **"Settings"**:
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `frontend/Dockerfile`

3. Vào tab **"Variables"** và thêm:
```bash
# API Backend URL (từ bước 3.3)
VITE_API_URL=https://flowline-backend-production.up.railway.app

# Google OAuth (phải giống backend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4.4 Generate Public URL
1. Vào tab **"Settings"** > **"Networking"**
2. Click **"Generate Domain"**
3. Copy URL (ví dụ: `https://flowline-production.up.railway.app`)

---

## 🔐 Bước 5: Config Google OAuth

### 5.1 Update Google Cloud Console
1. Truy cập: https://console.cloud.google.com/
2. Vào **APIs & Services** > **Credentials**
3. Chọn OAuth 2.0 Client ID của bạn
4. Thêm vào **Authorized JavaScript origins**:
   ```
   https://flowline-production.up.railway.app
   https://flowline-backend-production.up.railway.app
   ```
5. Thêm vào **Authorized redirect URIs**:
   ```
   https://flowline-production.up.railway.app/auth/callback
   https://flowline-backend-production.up.railway.app/api/auth/google/callback
   ```

---

## ✅ Bước 6: Kiểm Tra Deployment

### 6.1 Check Backend Health
```bash
curl https://flowline-backend-production.up.railway.app/health
```

### 6.2 Check Frontend
Mở browser và truy cập:
```
https://flowline-production.up.railway.app
```

### 6.3 Check Logs
1. Vào Railway Dashboard
2. Click vào từng service
3. Vào tab **"Deployments"**
4. Click vào deployment mới nhất
5. Xem logs để debug nếu có lỗi

---

## 🔄 Bước 7: Auto Deploy

Railway tự động deploy khi bạn push code lên GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway sẽ tự động:
1. Detect changes
2. Rebuild Docker images
3. Deploy services mới
4. Zero-downtime deployment

---

## 📊 Monitoring Free Tier

Railway free tier cung cấp:
- **$5 credit/month**
- **500MB PostgreSQL storage**
- **Unlimited bandwidth** (trong limit)

Check usage:
1. Vào Railway Dashboard
2. Click vào **"Usage"** ở sidebar
3. Xem credit còn lại

---

## 🐛 Troubleshooting

### Issue 1: Build Failed
**Solution:**
1. Check logs trong tab "Deployments"
2. Verify Dockerfile path đúng
3. Check Root Directory setting

### Issue 2: Database Connection Failed
**Solution:**
1. Verify biến `ConnectionStrings__DefaultConnection`
2. Check PostgreSQL service đang chạy
3. Test connection:
   ```bash
   railway run psql $DATABASE_URL
   ```

### Issue 3: Frontend không kết nối được Backend
**Solution:**
1. Verify `VITE_API_URL` đúng
2. Check CORS settings trong backend
3. Verify Google OAuth redirect URIs

### Issue 4: Out of Credits
**Solution:**
1. Upgrade to paid plan ($5/month)
2. Optimize resource usage
3. Hoặc chuyển sang Fly.io/Render

---

## 🎁 Bonus: Railway CLI Commands

```bash
# Link project local với Railway
railway link

# Xem logs real-time
railway logs

# Chạy command trong Railway environment
railway run <command>

# Open database shell
railway run psql $DATABASE_URL

# Deploy manual
railway up

# Add variables
railway variables set KEY=VALUE

# Open dashboard
railway open
```

---

## 📚 Resources

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- .NET on Railway: https://docs.railway.app/guides/dotnet

---

## 🎯 Quick Start Script

Tôi đã tạo script `deploy-railway.sh` để tự động hóa một số bước. Xem file đó để biết thêm chi tiết.

---

**Chúc bạn deploy thành công! 🚀**

Nếu gặp vấn đề, hãy check logs trên Railway Dashboard hoặc liên hệ Railway support.
