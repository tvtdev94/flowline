# 📁 Railway Deployment Files

## Danh Sách Files Đã Tạo

### 1. `RAILWAY_DEPLOY.md`
**Mục đích:** Hướng dẫn deploy chi tiết từng bước lên Railway

**Nội dung:**
- Cách tạo tài khoản Railway
- Cách setup PostgreSQL database
- Cách deploy backend (.NET)
- Cách deploy frontend (React)
- Config Google OAuth
- Troubleshooting và monitoring

**Khi nào dùng:** Đọc kỹ trước khi deploy lần đầu

---

### 2. `RAILWAY_QUICKSTART.md`
**Mục đích:** Hướng dẫn deploy nhanh trong 5 phút

**Nội dung:**
- 5 bước deploy cơ bản
- Copy-paste environment variables
- Quick troubleshooting

**Khi nào dùng:** Khi bạn đã quen với Railway và muốn deploy nhanh

---

### 3. `.env.railway.example`
**Mục đích:** Template cho environment variables trên Railway

**Nội dung:**
- Backend variables (database, OAuth, JWT)
- Frontend variables (API URL, Google Client ID)
- Hướng dẫn sử dụng Railway variable references

**Cách dùng:**
1. Copy variables từ file này
2. Paste vào Railway Dashboard > Service > Variables
3. Thay YOUR_VALUE bằng giá trị thực

---

### 4. `deploy-railway.sh`
**Mục đích:** Script helper tự động hóa deployment

**Tính năng:**
- Check Railway CLI
- Generate JWT Secret
- Deploy backend/frontend
- View logs
- Test backend health
- Show variables template

**Cách dùng:**
```bash
chmod +x deploy-railway.sh
./deploy-railway.sh
```

Chọn option trong menu interactive.

---

### 5. `.railwayignore`
**Mục đích:** Exclude files không cần thiết khi deploy

**Loại bỏ:**
- Environment files (.env)
- Development files (logs, test files)
- Docker compose files (Railway dùng Dockerfile)
- Build artifacts (node_modules, dist, bin, obj)
- IDE và OS files

**Lợi ích:**
- Deploy nhanh hơn
- Tiết kiệm bandwidth
- Bảo mật hơn

---

### 6. `railway.json`
**Mục đích:** Config build và deploy cho Railway

**Nội dung:**
- Builder: DOCKERFILE
- Deploy config: replicas, restart policy
- Health check settings

**Lưu ý:** Railway tự động detect Dockerfile, file này là optional nhưng giúp customize.

---

## 🎯 Workflow Deploy Khuyên Dùng

### Lần Đầu Tiên:
1. Đọc `RAILWAY_DEPLOY.md` kỹ
2. Chạy `./deploy-railway.sh` > Option 2 để generate JWT Secret
3. Follow hướng dẫn trong `RAILWAY_DEPLOY.md`
4. Copy variables từ `.env.railway.example`
5. Deploy!

### Deploy Sau:
1. Push code lên GitHub
2. Railway tự động deploy
3. Hoặc dùng `./deploy-railway.sh` để manual deploy

### Quick Reference:
- Cần deploy nhanh? → `RAILWAY_QUICKSTART.md`
- Cần variables? → `.env.railway.example`
- Troubleshooting? → `RAILWAY_DEPLOY.md` > Troubleshooting section

---

## 🔗 Liên Kết Hữu Ích

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app/
- Google Cloud Console: https://console.cloud.google.com/

---

## 💡 Tips

1. **Bookmark** Railway Dashboard URL sau khi tạo project
2. **Save** Backend và Frontend URLs ở đâu đó
3. **Monitor** usage thường xuyên (Dashboard > Usage)
4. **Setup** GitHub webhook để auto deploy
5. **Enable** 2FA trên Railway account để bảo mật

---

**Happy Deploying! 🚀**
