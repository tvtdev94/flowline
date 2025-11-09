#!/bin/bash

# Flowline Development Environment Startup Script
# This script starts both backend and frontend servers

set -e

echo "========================================="
echo "🚀 Flowline Development Environment"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dotnet is available
if ! command -v dotnet &> /dev/null; then
    echo -e "${YELLOW}⚠️  .NET SDK not found. Please install .NET 8.0 SDK${NC}"
    echo "Download from: https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
fi

# Check if node is available
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo -e "${BLUE}📦 Checking backend dependencies...${NC}"
cd backend/Flowline.Api
dotnet restore

echo ""
echo -e "${BLUE}📦 Checking frontend dependencies...${NC}"
cd ../../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
fi

echo ""
echo -e "${GREEN}✅ Dependencies ready!${NC}"
echo ""

# Create logs directory
mkdir -p ../logs

echo -e "${BLUE}🔧 Starting Backend API (ASP.NET Core)...${NC}"
echo "   Port: 5000"
echo "   Logs: logs/backend.log"
cd ../backend/Flowline.Api
dotnet run > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend failed to start. Check logs/backend.log${NC}"
    exit 1
fi

# Test backend health
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend started but health check failed${NC}"
fi

echo ""
echo -e "${BLUE}🎨 Starting Frontend (Vite + React)...${NC}"
echo "   Port: 5173 (default)"
echo "   Logs: logs/frontend.log"
cd ../../frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 3

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}🎉 Development servers are running!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "📡 Backend API:  ${BLUE}http://localhost:5000${NC}"
echo -e "   Swagger UI:   ${BLUE}http://localhost:5000/swagger${NC}"
echo -e "   Health Check: ${BLUE}http://localhost:5000/health${NC}"
echo ""
echo -e "🌐 Frontend:     ${BLUE}http://localhost:5173${NC}"
echo ""
echo -e "📝 Logs:"
echo -e "   Backend:  ${YELLOW}logs/backend.log${NC}"
echo -e "   Frontend: ${YELLOW}logs/frontend.log${NC}"
echo ""
echo -e "${YELLOW}To view logs in real-time:${NC}"
echo -e "   tail -f logs/backend.log"
echo -e "   tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo -e "   kill $BACKEND_PID $FRONTEND_PID"
echo -e "   or press Ctrl+C and run: killall dotnet node"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""

# Save PIDs to file for easy cleanup
echo "BACKEND_PID=$BACKEND_PID" > .dev-pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .dev-pids

# Keep script running and show logs
echo -e "${BLUE}Showing live logs (Ctrl+C to stop)...${NC}"
echo ""
tail -f ../logs/backend.log ../logs/frontend.log
