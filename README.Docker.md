# FLOWLINE Docker Setup

This guide explains how to run FLOWLINE using Docker Compose with Caddy reverse proxy.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```bash
# Required: Database password
DATABASE_PASSWORD=your_secure_password

# Required for Google OAuth (or use dev mode)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret

# Required: JWT secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_secure_jwt_secret_min_32_chars
```

### 2. Development Mode (No Google OAuth needed)

For quick development without Google OAuth:

```bash
# In .env, set:
ENABLE_GOOGLE_AUTH=false
```

This allows you to use the `/api/auth/dev-login` endpoint.

### 3. Build and Run

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove all data
docker compose down -v
```

## Services

After running `docker compose up -d`, the following services will be available:

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost | Full application via Caddy |
| **Frontend** | http://localhost:3000 | React frontend (direct) |
| **Backend API** | http://localhost:5000 | .NET API (direct) |
| **Swagger** | http://localhost:5000/swagger | API documentation |
| **PostgreSQL** | localhost:5432 | Database |

### Service Details

#### Caddy (Reverse Proxy)
- **Port:** 80 (HTTP), 443 (HTTPS)
- **Routes:**
  - `/` → Frontend
  - `/api/*` → Backend
  - `/hubs/*` → Backend (SignalR WebSocket)
  - `/health` → Backend health check
  - `/swagger` → API documentation

#### Backend (.NET 8 API)
- **Port:** 5000
- **Container:** `flowline-backend`
- **Health Check:** http://localhost:5000/health

#### Frontend (React + Nginx)
- **Port:** 3000
- **Container:** `flowline-frontend`
- **Served by:** Nginx

#### PostgreSQL
- **Port:** 5432
- **Container:** `flowline-postgres`
- **Database:** flowline
- **Volume:** `postgres_data` (persisted)

## Development Workflow

### Run only the database (develop backend/frontend locally)

```bash
docker compose up -d postgres
```

Then run backend and frontend from your IDE/terminal:

```bash
# Backend
cd backend/Flowline.Api
dotnet run

# Frontend
cd frontend
npm run dev
```

### Rebuild after code changes

```bash
# Rebuild specific service
docker compose build backend
docker compose build frontend

# Restart service
docker compose up -d backend
docker compose up -d frontend
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f caddy
```

### Database migrations

Migrations run automatically on backend startup. To run manually:

```bash
docker compose exec backend dotnet ef database update
```

## Production Deployment

### 1. Update Environment

```bash
# In .env:
ASPNETCORE_ENVIRONMENT=Production
ENABLE_GOOGLE_AUTH=true
DATABASE_PASSWORD=strong_random_password
JWT_SECRET=strong_random_secret_min_32_chars
```

### 2. Configure Domain (Optional)

For automatic HTTPS with a real domain:

```bash
# In .env:
DOMAIN=flowline.yourdomain.com
```

Update `Caddyfile`:
```
flowline.yourdomain.com {
    # ... rest of config
}
```

### 3. Disable Swagger (Security)

In `Caddyfile`, comment out:
```
# handle /swagger* {
#     reverse_proxy backend:5000
# }
```

### 4. Deploy

```bash
docker compose up -d --build
```

## Troubleshooting

### Backend fails to start
```bash
# Check logs
docker compose logs backend

# Common issues:
# 1. Database not ready → Wait for postgres healthcheck
# 2. Missing env vars → Check .env file
# 3. Port conflict → Change port in docker-compose.yml
```

### Frontend not loading
```bash
# Check nginx logs
docker compose logs frontend

# Check if backend API is accessible
curl http://localhost:5000/health
```

### Database connection errors
```bash
# Check postgres status
docker compose ps postgres

# Access database
docker compose exec postgres psql -U postgres -d flowline

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

### Caddy issues
```bash
# Check Caddyfile syntax
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy config
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## Useful Commands

```bash
# View running containers
docker compose ps

# Stop all services
docker compose stop

# Start all services
docker compose start

# Restart specific service
docker compose restart backend

# Remove everything (including volumes)
docker compose down -v

# Rebuild without cache
docker compose build --no-cache

# Scale services (if needed)
docker compose up -d --scale backend=2

# Access container shell
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec postgres sh

# View container resource usage
docker compose stats
```

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Internet / Browser              │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────┐
│        Caddy (Reverse Proxy)           │
│          Port 80/443                   │
│  Routes:                               │
│  - /          → Frontend               │
│  - /api/*     → Backend                │
│  - /hubs/*    → Backend (SignalR)      │
└────┬───────────────────────┬───────────┘
     │                       │
     ↓                       ↓
┌─────────────┐      ┌──────────────────┐
│  Frontend   │      │    Backend API   │
│  (React)    │      │    (.NET 8)      │
│  Nginx:80   │      │    Port 5000     │
└─────────────┘      └────────┬─────────┘
                              │
                              ↓
                     ┌──────────────────┐
                     │   PostgreSQL 16  │
                     │    Port 5432     │
                     └──────────────────┘
```

## Volume Management

Volumes persist data across container restarts:

- **postgres_data**: Database files
- **caddy_data**: Caddy certificates and data
- **caddy_config**: Caddy configuration cache

### Backup database

```bash
# Export
docker compose exec postgres pg_dump -U postgres flowline > backup.sql

# Import
docker compose exec -T postgres psql -U postgres flowline < backup.sql
```

## Security Checklist for Production

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (min 32 chars)
- [ ] Enable Google OAuth (ENABLE_GOOGLE_AUTH=true)
- [ ] Disable Swagger in production
- [ ] Use HTTPS with real domain
- [ ] Set ASPNETCORE_ENVIRONMENT=Production
- [ ] Restrict database access (firewall rules)
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker images updated

## Support

For issues and questions:
- Check logs: `docker compose logs -f`
- Review this guide
- Check PLAN.md for architecture details
