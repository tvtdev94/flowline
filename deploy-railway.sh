#!/bin/bash

# ===========================================
# Railway Deployment Helper Script
# ===========================================
# This script helps automate Railway deployment
# Usage: ./deploy-railway.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed"
        print_info "Install with: curl -fsSL https://railway.app/install.sh | sh"
        print_info "Or with npm: npm i -g @railway/cli"
        exit 1
    fi
    print_success "Railway CLI is installed"
}

# Check if logged in
check_railway_login() {
    if ! railway whoami &> /dev/null; then
        print_warning "Not logged in to Railway"
        print_info "Running: railway login"
        railway login
    fi
    print_success "Logged in to Railway"
}

# Generate JWT Secret
generate_jwt_secret() {
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated JWT Secret:${NC}"
    echo "$JWT_SECRET"
    echo ""
    echo -e "${YELLOW}Save this to Railway Backend Variables as JWT_SECRET${NC}"
}

# Main menu
show_menu() {
    clear
    print_header "Railway Deployment Helper - Flowline"
    echo ""
    echo "1) Check Railway CLI & Login Status"
    echo "2) Generate JWT Secret"
    echo "3) Create New Railway Project"
    echo "4) Link Existing Railway Project"
    echo "5) Deploy Backend Service"
    echo "6) Deploy Frontend Service"
    echo "7) View Deployment Logs"
    echo "8) Open Railway Dashboard"
    echo "9) Show Backend Environment Variables Template"
    echo "10) Show Frontend Environment Variables Template"
    echo "11) Test Backend Health"
    echo "12) Full Deployment Guide"
    echo "0) Exit"
    echo ""
}

# Create new Railway project
create_project() {
    print_header "Creating New Railway Project"
    print_info "Opening browser to create new project..."
    railway init
    print_success "Project initialized!"
    print_warning "Next steps:"
    echo "1. Add PostgreSQL database in Railway Dashboard"
    echo "2. Configure environment variables"
    echo "3. Deploy backend and frontend services"
}

# Link existing project
link_project() {
    print_header "Linking to Existing Railway Project"
    railway link
    print_success "Project linked!"
}

# Deploy backend
deploy_backend() {
    print_header "Deploying Backend Service"
    print_info "Building and deploying backend..."

    cd backend
    railway up
    cd ..

    print_success "Backend deployed!"
    print_info "Don't forget to:"
    echo "1. Set Root Directory to 'backend' in Railway Settings"
    echo "2. Add all environment variables from .env.railway.example"
    echo "3. Generate a public domain for the backend"
}

# Deploy frontend
deploy_frontend() {
    print_header "Deploying Frontend Service"

    # Check if VITE_API_URL is set
    if [ -z "$VITE_API_URL" ]; then
        print_warning "VITE_API_URL not set"
        read -p "Enter your Railway backend URL: " VITE_API_URL
        export VITE_API_URL
    fi

    print_info "Building and deploying frontend..."
    print_info "Backend URL: $VITE_API_URL"

    cd frontend
    railway up
    cd ..

    print_success "Frontend deployed!"
    print_info "Don't forget to:"
    echo "1. Set Root Directory to 'frontend' in Railway Settings"
    echo "2. Add VITE_API_URL and VITE_GOOGLE_CLIENT_ID variables"
    echo "3. Generate a public domain for the frontend"
}

# View logs
view_logs() {
    print_header "Viewing Deployment Logs"
    print_info "Press Ctrl+C to exit logs"
    railway logs
}

# Open dashboard
open_dashboard() {
    print_header "Opening Railway Dashboard"
    railway open
}

# Show backend variables template
show_backend_vars() {
    print_header "Backend Environment Variables Template"
    cat << EOF
Copy these to Railway Backend Service > Variables:

ConnectionStrings__DefaultConnection=Host=\${{Postgres.PGHOST}};Port=\${{Postgres.PGPORT}};Database=\${{Postgres.PGDATABASE}};Username=\${{Postgres.PGUSER}};Password=\${{Postgres.PGPASSWORD}}
Google__ClientId=your-google-client-id.apps.googleusercontent.com
Google__ClientSecret=your-google-client-secret
JWT_SECRET=<generate-with-option-2>
Jwt__Secret=\${{JWT_SECRET}}
Jwt__Issuer=flowline-api
Jwt__Audience=flowline-app
Jwt__ExpiryMinutes=60
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000
PORT=5000
Development__EnableGoogleAuth=true
EOF
    echo ""
}

# Show frontend variables template
show_frontend_vars() {
    print_header "Frontend Environment Variables Template"
    cat << EOF
Copy these to Railway Frontend Service > Variables:

VITE_API_URL=https://your-backend-name.up.railway.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EOF
    echo ""
}

# Test backend health
test_backend() {
    print_header "Testing Backend Health"
    read -p "Enter your Railway backend URL: " BACKEND_URL

    print_info "Testing: $BACKEND_URL/health"

    if curl -f "$BACKEND_URL/health" 2>/dev/null; then
        print_success "Backend is healthy!"
    else
        print_error "Backend health check failed"
        print_info "Check Railway logs for errors"
    fi
}

# Show full guide
show_guide() {
    print_header "Full Deployment Guide"

    if [ -f "RAILWAY_DEPLOY.md" ]; then
        if command -v bat &> /dev/null; then
            bat RAILWAY_DEPLOY.md
        elif command -v less &> /dev/null; then
            less RAILWAY_DEPLOY.md
        else
            cat RAILWAY_DEPLOY.md
        fi
    else
        print_error "RAILWAY_DEPLOY.md not found"
    fi
}

# Main loop
main() {
    while true; do
        show_menu
        read -p "Select an option: " choice
        echo ""

        case $choice in
            1)
                check_railway_cli
                check_railway_login
                read -p "Press Enter to continue..."
                ;;
            2)
                generate_jwt_secret
                read -p "Press Enter to continue..."
                ;;
            3)
                check_railway_cli
                check_railway_login
                create_project
                read -p "Press Enter to continue..."
                ;;
            4)
                check_railway_cli
                check_railway_login
                link_project
                read -p "Press Enter to continue..."
                ;;
            5)
                check_railway_cli
                check_railway_login
                deploy_backend
                read -p "Press Enter to continue..."
                ;;
            6)
                check_railway_cli
                check_railway_login
                deploy_frontend
                read -p "Press Enter to continue..."
                ;;
            7)
                check_railway_cli
                check_railway_login
                view_logs
                ;;
            8)
                check_railway_cli
                check_railway_login
                open_dashboard
                read -p "Press Enter to continue..."
                ;;
            9)
                show_backend_vars
                read -p "Press Enter to continue..."
                ;;
            10)
                show_frontend_vars
                read -p "Press Enter to continue..."
                ;;
            11)
                test_backend
                read -p "Press Enter to continue..."
                ;;
            12)
                show_guide
                read -p "Press Enter to continue..."
                ;;
            0)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option"
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

# Run main
main
