#!/bin/bash

# Flowline API Endpoint Testing Script
# Make sure the API is running before executing this script
# Usage: ./test-endpoints.sh

BASE_URL="http://localhost:5000"
CONTENT_TYPE="Content-Type: application/json"

echo "========================================="
echo "Flowline API Endpoint Testing"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==================== HEALTH CHECK ====================
echo -e "${YELLOW}Testing Health Check...${NC}"
curl -X GET "$BASE_URL/health" \
  -H "$CONTENT_TYPE" \
  -w "\nStatus: %{http_code}\n\n"

# ==================== AUTH ENDPOINTS ====================
echo -e "${YELLOW}Testing Dev Login (Auth)...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/dev-login" \
  -H "$CONTENT_TYPE" \
  -w "\nStatus: %{http_code}")

echo "$LOGIN_RESPONSE"
echo ""

# Extract token from response (if jq is available)
if command -v jq &> /dev/null; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -v "Status:" | jq -r '.token')
    USER_ID=$(echo "$LOGIN_RESPONSE" | grep -v "Status:" | jq -r '.user.id')
    echo -e "${GREEN}Token extracted: ${TOKEN:0:20}...${NC}"
    echo -e "${GREEN}User ID: $USER_ID${NC}"
    echo ""
else
    echo -e "${RED}jq not installed. Please extract token manually.${NC}"
    echo "Enter token: "
    read TOKEN
    echo "Enter user ID: "
    read USER_ID
fi

# ==================== AUTH ME ====================
echo -e "${YELLOW}Testing Get Current User...${NC}"
curl -X GET "$BASE_URL/api/auth/me" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

# ==================== PROJECT ENDPOINTS ====================
echo -e "${YELLOW}Testing Create Project...${NC}"
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/projects" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"name\": \"Test Project\",
    \"description\": \"Project created by test script\",
    \"color\": \"#3B82F6\"
  }" \
  -w "\nStatus: %{http_code}")

echo "$PROJECT_RESPONSE"
echo ""

if command -v jq &> /dev/null; then
    PROJECT_ID=$(echo "$PROJECT_RESPONSE" | grep -v "Status:" | jq -r '.id')
    echo -e "${GREEN}Project ID: $PROJECT_ID${NC}"
    echo ""
fi

echo -e "${YELLOW}Testing Get Projects...${NC}"
curl -X GET "$BASE_URL/api/projects?userId=$USER_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

# ==================== TASK ENDPOINTS ====================
echo -e "${YELLOW}Testing Create Task...${NC}"
TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tasks" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"projectId\": \"$PROJECT_ID\",
    \"title\": \"Test Task\",
    \"description\": \"Task created by test script\",
    \"status\": 0
  }" \
  -w "\nStatus: %{http_code}")

echo "$TASK_RESPONSE"
echo ""

if command -v jq &> /dev/null; then
    TASK_ID=$(echo "$TASK_RESPONSE" | grep -v "Status:" | jq -r '.id')
    echo -e "${GREEN}Task ID: $TASK_ID${NC}"
    echo ""
fi

echo -e "${YELLOW}Testing Get Tasks...${NC}"
curl -X GET "$BASE_URL/api/tasks?userId=$USER_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

# ==================== TIME ENTRY ENDPOINTS ====================
echo -e "${YELLOW}Testing Start Timer...${NC}"
TIMER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/time-entries/start" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"projectId\": \"$PROJECT_ID\",
    \"taskId\": \"$TASK_ID\",
    \"description\": \"Working on test task\"
  }" \
  -w "\nStatus: %{http_code}")

echo "$TIMER_RESPONSE"
echo ""

if command -v jq &> /dev/null; then
    TIME_ENTRY_ID=$(echo "$TIMER_RESPONSE" | grep -v "Status:" | jq -r '.id')
    echo -e "${GREEN}Time Entry ID: $TIME_ENTRY_ID${NC}"
    echo ""
fi

echo -e "${YELLOW}Testing Get Running Timers...${NC}"
curl -X GET "$BASE_URL/api/time-entries/running?userId=$USER_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${YELLOW}Waiting 2 seconds before stopping timer...${NC}"
sleep 2

echo -e "${YELLOW}Testing Stop Timer...${NC}"
curl -X PATCH "$BASE_URL/api/time-entries/$TIME_ENTRY_ID/stop" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${YELLOW}Testing Get Time Entries...${NC}"
curl -X GET "$BASE_URL/api/time-entries?userId=$USER_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

# ==================== STATS ENDPOINTS ====================
echo -e "${YELLOW}Testing Get Daily Stats...${NC}"
TODAY=$(date +%Y-%m-%d)
curl -X GET "$BASE_URL/api/stats/daily?userId=$USER_ID&date=$TODAY" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${YELLOW}Testing Get Weekly Stats...${NC}"
curl -X GET "$BASE_URL/api/stats/weekly?userId=$USER_ID&startDate=$TODAY" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${YELLOW}Testing Get Monthly Stats...${NC}"
YEAR=$(date +%Y)
MONTH=$(date +%-m)
curl -X GET "$BASE_URL/api/stats/monthly?userId=$USER_ID&year=$YEAR&month=$MONTH" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

# ==================== TEAM ENDPOINTS ====================
echo -e "${YELLOW}Testing Create Team...${NC}"
TEAM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/teams" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Test Team\",
    \"description\": \"Team created by test script\",
    \"ownerId\": \"$USER_ID\"
  }" \
  -w "\nStatus: %{http_code}")

echo "$TEAM_RESPONSE"
echo ""

if command -v jq &> /dev/null; then
    TEAM_ID=$(echo "$TEAM_RESPONSE" | grep -v "Status:" | jq -r '.id')
    echo -e "${GREEN}Team ID: $TEAM_ID${NC}"
    echo ""
fi

echo -e "${YELLOW}Testing Get Teams...${NC}"
curl -X GET "$BASE_URL/api/teams?userId=$USER_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

echo -e "${YELLOW}Testing Get Team By ID...${NC}"
curl -X GET "$BASE_URL/api/teams/$TEAM_ID?userId=$USER_ID" \
  -H "$CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nStatus: %{http_code}\n\n"

# ==================== CLEANUP ====================
echo -e "${YELLOW}Cleaning up test data...${NC}"

if [ ! -z "$TASK_ID" ]; then
    echo "Deleting Task..."
    curl -s -X DELETE "$BASE_URL/api/tasks/$TASK_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -w "Status: %{http_code}\n"
fi

if [ ! -z "$PROJECT_ID" ]; then
    echo "Deleting Project..."
    curl -s -X DELETE "$BASE_URL/api/projects/$PROJECT_ID?userId=$USER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -w "Status: %{http_code}\n"
fi

if [ ! -z "$TEAM_ID" ]; then
    echo "Deleting Team..."
    curl -s -X DELETE "$BASE_URL/api/teams/$TEAM_ID?userId=$USER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -w "Status: %{http_code}\n"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${GREEN}=========================================${NC}"
