# 🚀 Railway Quick Start - 5 Phút Deploy

## Yêu Cầu

- Tài khoản GitHub
- Tài khoản Railway (miễn phí)
- Google OAuth credentials (từ Google Cloud Console)

---

## ⚡ Deploy Nhanh (5 bước)

### 1️⃣ Tạo Project trên Railway

```bash
# Truy cập Railway Dashboard
https://railway.app/dashboard

# Click "New Project" > "Deploy from GitHub repo"
# Chọn repository flowline
```

### 2️⃣ Thêm PostgreSQL Database

```bash
# Trong project vừa tạo
# Click "New" > "Database" > "Add PostgreSQL"
```

### 3️⃣ Deploy Backend

**Settings:**
- Root Directory: `backend`
- Dockerfile Path: `backend/Dockerfile`

**Variables** (copy từ `.env.railway.example`):
```bash
ConnectionStrings__DefaultConnection=Host=${{Postgres.PGHOST}};Port=${{Postgres.PGPORT}};Database=${{Postgres.PGDATABASE}};Username=${{Postgres.PGUSER}};Password=${{Postgres.PGPASSWORD}}
Google__ClientId=YOUR_GOOGLE_CLIENT_ID
Google__ClientSecret=YOUR_GOOGLE_CLIENT_SECRET
JWT_SECRET=<run: openssl rand -base64 32>
Jwt__Secret=${{JWT_SECRET}}
Jwt__Issuer=flowline-api
Jwt__Audience=flowline-app
Jwt__ExpiryMinutes=60
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000
PORT=5000
Development__EnableGoogleAuth=true
```

**Generate Domain:**
- Settings > Networking > Generate Domain
- Copy URL (ví dụ: `https://backend-xxx.up.railway.app`)

### 4️⃣ Deploy Frontend

**Settings:**
- Root Directory: `frontend`
- Dockerfile Path: `frontend/Dockerfile`

**Variables:**
```bash
VITE_API_URL=<backend-url-from-step-3>
VITE_GOOGLE_CLIENT_ID=<same-as-backend>
```

**Generate Domain:**
- Settings > Networking > Generate Domain
- Copy URL (ví dụ: `https://flowline-xxx.up.railway.app`)

### 5️⃣ Update Google OAuth

Vào Google Cloud Console > Credentials:

**Authorized JavaScript origins:**
```
https://flowline-xxx.up.railway.app
https://backend-xxx.up.railway.app
```

**Authorized redirect URIs:**
```
https://flowline-xxx.up.railway.app/auth/callback
https://backend-xxx.up.railway.app/api/auth/google/callback
```

---

## ✅ Kiểm Tra

1. **Backend Health:**
   ```bash
   curl https://backend-xxx.up.railway.app/health
   ```

2. **Frontend:** Mở browser
   ```
   https://flowline-xxx.up.railway.app
   ```

---

## 🛠️ Helper Script

Sử dụng script tự động:
```bash
./deploy-railway.sh
```

Chọn option trong menu để:
- Generate JWT Secret
- View environment variables template
- Deploy services
- View logs

---

## 📊 Free Tier Limits

- **$5 credit/month** (~500 hours uptime)
- **500MB PostgreSQL**
- **100GB bandwidth**

**Tip:** Đủ cho development và small projects!

---

## 🔧 Troubleshooting

**Build failed?**
```bash
# Check logs
Railway Dashboard > Service > Deployments > View Logs
```

**Database connection error?**
```bash
# Verify variables
Railway Dashboard > Backend > Variables
# Check ConnectionStrings__DefaultConnection
```

**Frontend không load?**
```bash
# Verify VITE_API_URL trong Frontend variables
# Check CORS settings trong backend
```

---

## 📚 Tài Liệu Đầy Đủ

Xem `RAILWAY_DEPLOY.md` để biết chi tiết đầy đủ.

---

**Deploy thành công! 🎉**
