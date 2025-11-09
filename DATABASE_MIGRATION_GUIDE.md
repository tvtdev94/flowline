# 📦 Database Migration Guide

## Overview

This guide explains how to generate and apply database migrations for the Flowline application.

---

## 🚀 Quick Start

### Generate New Migration

```bash
cd backend
dotnet ef migrations add AddPerformanceIndexes
```

### Apply Migration to Database

```bash
dotnet ef database update
```

---

## 📋 Detailed Instructions

### Prerequisites

1. **.NET 8 SDK** installed
2. **EF Core CLI tools** installed:
   ```bash
   dotnet tool install --global dotnet-ef
   # Or update existing:
   dotnet tool update --global dotnet-ef
   ```

3. **PostgreSQL** database running (Docker or local)

4. **Connection string** configured in `.env` or `appsettings.json`

---

## 🔧 Step-by-Step Migration Process

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Check Current Migration Status

```bash
dotnet ef migrations list
```

Expected output:
```
20251108173900_InitialCreate
20251109_AddPerformanceIndexes (pending)
```

### Step 3: Generate Migration (if needed)

If you made changes to `ApplicationDbContext.cs`:

```bash
dotnet ef migrations add MigrationName
```

Example:
```bash
dotnet ef migrations add AddPerformanceIndexes
```

This creates 3 files in `Flowline.Infrastructure/Migrations/`:
- `{timestamp}_MigrationName.cs` - Migration operations
- `{timestamp}_MigrationName.Designer.cs` - Metadata
- `ApplicationDbContextModelSnapshot.cs` - Updated model snapshot

### Step 4: Review Generated Migration

Open the generated migration file and verify:
- ✅ Correct indexes are being created
- ✅ No unintended table/column changes
- ✅ Rollback (Down) method is correct

Example:
```csharp
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.CreateIndex(
        name: "IX_TimeEntries_EndTime",
        table: "TimeEntries",
        column: "EndTime");
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropIndex(
        name: "IX_TimeEntries_EndTime",
        table: "TimeEntries");
}
```

### Step 5: Apply Migration to Database

**Development:**
```bash
dotnet ef database update
```

**Production (via Docker):**
```bash
docker-compose exec backend dotnet ef database update
```

**Specific Migration:**
```bash
dotnet ef database update MigrationName
```

### Step 6: Verify Migration Applied

```bash
# Check migration history
dotnet ef migrations list

# Or connect to PostgreSQL
psql -h localhost -U postgres -d flowline
\d+ "TimeEntries"  -- View table indexes
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Build failed"

**Error:**
```
Build failed. Use dotnet build to see the errors.
```

**Solution:**
```bash
cd backend
dotnet build
# Fix any compilation errors
dotnet ef migrations add MigrationName
```

### Issue 2: "No DbContext was found"

**Error:**
```
No DbContext named 'ApplicationDbContext' was found.
```

**Solution:**
```bash
# Specify project and startup project explicitly
dotnet ef migrations add MigrationName \
  --project Flowline.Infrastructure \
  --startup-project Flowline.Api
```

### Issue 3: "Connection string not found"

**Error:**
```
A connection string is required to connect to the database.
```

**Solution:**
Create `.env` file or update `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=flowline;Username=postgres;Password=postgres"
  }
}
```

### Issue 4: "Duplicate index name"

**Error:**
```
Index 'IX_TimeEntries_EndTime' already exists.
```

**Solution:**
```bash
# Rollback and recreate
dotnet ef database update PreviousMigration
dotnet ef migrations remove
# Fix index definition in ApplicationDbContext.cs
dotnet ef migrations add AddPerformanceIndexes
dotnet ef database update
```

### Issue 5: "Database is in use"

**Error:**
```
Cannot drop database "flowline" because it is currently in use.
```

**Solution:**
```bash
# Stop all backend instances
docker-compose down
# Or terminate connections in PostgreSQL
psql -h localhost -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'flowline';"
```

---

## 🔄 Rollback Migration

### Rollback to Previous Migration

```bash
dotnet ef database update PreviousMigrationName
```

### Rollback All Migrations

```bash
dotnet ef database update 0
```

### Remove Last Migration (before applying)

```bash
dotnet ef migrations remove
```

---

## 📦 Production Deployment

### Option 1: Apply During Deployment (Recommended)

Add to deployment script:
```bash
#!/bin/bash
cd backend
dotnet ef database update --verbose
dotnet run
```

### Option 2: Docker Entrypoint

Update `Dockerfile`:
```dockerfile
ENTRYPOINT ["sh", "-c", "dotnet ef database update && dotnet Flowline.Api.dll"]
```

### Option 3: Manual SQL Script

Generate SQL script for DBA review:
```bash
dotnet ef migrations script --output migration.sql
```

Review and apply:
```bash
psql -h production-db -U postgres -d flowline -f migration.sql
```

---

## 📊 Migration Best Practices

### 1. Always Review Generated Migrations

Never blindly apply migrations. Check:
- ✅ Only intended changes are included
- ✅ Rollback (Down) method works correctly
- ✅ No data loss operations (DROP TABLE, DROP COLUMN)

### 2. Test Migrations in Development First

```bash
# Test forward migration
dotnet ef database update

# Test rollback
dotnet ef database update PreviousMigration

# Test forward again
dotnet ef database update
```

### 3. Backup Production Database

```bash
pg_dump -h production-db -U postgres flowline > backup_$(date +%Y%m%d).sql
```

### 4. Use Transactional Migrations

EF Core migrations are transactional by default. Verify:
```csharp
// In migration file
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql("BEGIN;");
    // Your changes
    migrationBuilder.Sql("COMMIT;");
}
```

### 5. Keep Migrations Small and Focused

❌ Bad:
```bash
dotnet ef migrations add AddIndexesAndTablesAndColumns
```

✅ Good:
```bash
dotnet ef migrations add AddPerformanceIndexes
dotnet ef migrations add AddUserPreferencesTable
dotnet ef migrations add AddTaskPriorityColumn
```

---

## 🔍 Viewing Migration Status

### Check Applied Migrations

```bash
dotnet ef migrations list
```

### View Database Schema

```bash
psql -h localhost -U postgres -d flowline

-- List all tables
\dt

-- View table structure
\d+ "TimeEntries"

-- View all indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```

---

## 📚 Additional Resources

- [EF Core Migrations Docs](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [EF Core CLI Reference](https://learn.microsoft.com/en-us/ef/core/cli/dotnet)

---

## ✅ Verification Checklist

After migration:

- [ ] Migration applied successfully (no errors)
- [ ] Database indexes created (check with `\d+ table_name`)
- [ ] Application starts without errors
- [ ] Queries are faster (check response times)
- [ ] Rollback tested successfully
- [ ] Backup created (for production)

---

**Last Updated:** 2025-11-09
