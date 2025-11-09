# 🧪 Flowline Frontend Testing Plan

## Prerequisites

Before testing, ensure:
- ✅ Backend API is running on `http://localhost:5000`
- ✅ Frontend dev server is running on `http://localhost:5173`
- ✅ Browser developer tools are open (F12) to check for errors

## Quick Start

```bash
# Start both servers
./start-dev.sh

# Or manually:
# Terminal 1 - Backend
cd backend/Flowline.Api
dotnet run

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Test Cases

### 🔐 1. Authentication & Login

#### Test 1.1: Dev Login
**Steps:**
1. Open `http://localhost:5173`
2. You should see Login page
3. Click "Dev Login" button (or similar)
4. Should redirect to Dashboard

**Expected:**
- ✅ Login successful
- ✅ Token saved in localStorage
- ✅ Redirected to dashboard
- ✅ User name displayed in header

**Check Console:**
- No errors in browser console
- Check Network tab: POST `/api/auth/dev-login` returns 200

---

### 📊 2. Dashboard & Stats

#### Test 2.1: Dashboard Load
**Steps:**
1. After login, should be on Dashboard
2. Observe the main dashboard components

**Expected:**
- ✅ Timer/Task bar visible
- ✅ Timeline visible
- ✅ Stats panel visible
- ✅ Controls visible

#### Test 2.2: Stats Display
**Steps:**
1. Check Stats panel (Daily/Weekly/Monthly tabs)
2. Switch between tabs

**Expected:**
- ✅ Daily stats show today's data
- ✅ Weekly stats show current week
- ✅ Monthly stats show current month
- ✅ Charts render correctly

**Check Network:**
- GET `/api/stats/daily?userId=...&date=...` returns 200
- GET `/api/stats/weekly?userId=...&startDate=...` returns 200
- GET `/api/stats/monthly?userId=...&year=...&month=...` returns 200

---

### 📁 3. Project Management

#### Test 3.1: Create Project
**Steps:**
1. Click "Project Management" button/icon
2. Click "+ New Project" or similar
3. Enter project details:
   - Name: "Test Project"
   - Description: "Testing project creation"
   - Color: Select any color
4. Click "Create" or "Save"

**Expected:**
- ✅ Modal closes
- ✅ Success toast/message appears
- ✅ New project appears in project list
- ✅ Can select project in dropdown

**Check Network:**
- POST `/api/projects` returns 201
- Response contains project ID

#### Test 3.2: View Projects
**Steps:**
1. Open project management modal
2. View list of projects

**Expected:**
- ✅ All projects listed
- ✅ Project details displayed (name, color, description)
- ✅ Can see archived projects if toggled

**Check Network:**
- GET `/api/projects?userId=...` returns 200

#### Test 3.3: Update Project
**Steps:**
1. In project list, click "Edit" on a project
2. Change name to "Updated Project Name"
3. Change color
4. Click "Save"

**Expected:**
- ✅ Project updated successfully
- ✅ Changes reflected in UI
- ✅ Success message shown

**Check Network:**
- PUT `/api/projects/{id}` returns 200

#### Test 3.4: Delete Project
**Steps:**
1. Click "Delete" on a project
2. Confirm deletion (if prompted)

**Expected:**
- ✅ Project removed from list
- ✅ Success message shown

**Check Network:**
- DELETE `/api/projects/{id}?userId=...` returns 204

---

### ✅ 4. Task Management

#### Test 4.1: Create Task
**Steps:**
1. Click "Create Task" or "+" button
2. Enter task details:
   - Title: "Test Task"
   - Description: "Testing task creation"
   - Select project (if available)
   - Status: Todo
3. Click "Create"

**Expected:**
- ✅ Task created successfully
- ✅ Task appears in task list
- ✅ Success message shown

**Check Network:**
- POST `/api/tasks` returns 201

#### Test 4.2: View Tasks
**Steps:**
1. View task list on dashboard
2. Filter by project (if available)

**Expected:**
- ✅ All tasks displayed
- ✅ Task details visible (title, description, status)
- ✅ Filtering works correctly

**Check Network:**
- GET `/api/tasks?userId=...` returns 200
- GET `/api/tasks?userId=...&projectId=...` returns 200

#### Test 4.3: Update Task
**Steps:**
1. Click on a task to edit
2. Change title to "Updated Task"
3. Change status (Todo → In Progress → Done)
4. Save changes

**Expected:**
- ✅ Task updated successfully
- ✅ Changes reflected immediately
- ✅ Status change visible

**Check Network:**
- PUT `/api/tasks/{id}` returns 200

#### Test 4.4: Delete Task
**Steps:**
1. Click delete icon on a task
2. Confirm deletion

**Expected:**
- ✅ Task removed from list
- ✅ Success message shown

**Check Network:**
- DELETE `/api/tasks/{id}` returns 204

---

### ⏱️ 5. Time Tracking

#### Test 5.1: Start Timer
**Steps:**
1. Select a task (or create one)
2. Select a project
3. Enter description (optional)
4. Click "Start" or timer icon

**Expected:**
- ✅ Timer starts running
- ✅ Timer display shows elapsed time
- ✅ Start time recorded
- ✅ "Stop" button visible

**Check Network:**
- POST `/api/time-entries/start` returns 201
- Response contains time entry ID

#### Test 5.2: Running Timer Display
**Steps:**
1. After starting timer, observe the display
2. Wait a few seconds

**Expected:**
- ✅ Timer updates every second
- ✅ Shows HH:MM:SS format
- ✅ Shows current task/project

**Check Network (if using SignalR):**
- WebSocket connection to `/hubs/timer` established
- Receives timer updates

#### Test 5.3: Stop Timer
**Steps:**
1. With timer running, click "Stop" button

**Expected:**
- ✅ Timer stops
- ✅ Duration calculated correctly
- ✅ Time entry saved
- ✅ Entry appears in timeline/history

**Check Network:**
- PATCH `/api/time-entries/{id}/stop` returns 200

#### Test 5.4: View Time Entries
**Steps:**
1. View timeline or time entries list
2. Check today's entries

**Expected:**
- ✅ All time entries displayed
- ✅ Correct duration shown
- ✅ Sorted by date/time

**Check Network:**
- GET `/api/time-entries?userId=...` returns 200
- GET `/api/time-entries/running?userId=...` returns 200

#### Test 5.5: Edit Time Entry
**Steps:**
1. Click edit on a time entry
2. Change description
3. Adjust start/end time
4. Save

**Expected:**
- ✅ Time entry updated
- ✅ Duration recalculated
- ✅ Changes visible

**Check Network:**
- PUT `/api/time-entries/{id}` returns 200

#### Test 5.6: Delete Time Entry
**Steps:**
1. Click delete on a time entry
2. Confirm deletion

**Expected:**
- ✅ Entry removed
- ✅ Stats updated

**Check Network:**
- DELETE `/api/time-entries/{id}` returns 204

---

### 👥 6. Team Management (If Implemented)

#### Test 6.1: Create Team
**Steps:**
1. Open Team Management
2. Click "Create Team"
3. Enter team name: "Test Team"
4. Click "Create"

**Expected:**
- ✅ Team created
- ✅ You're the owner
- ✅ Team appears in list

**Check Network:**
- POST `/api/teams` returns 201

#### Test 6.2: Add Team Member
**Steps:**
1. Select a team
2. Click "Add Member"
3. Enter email: "member@example.com"
4. Select role
5. Click "Add"

**Expected:**
- ✅ Member added
- ✅ Appears in member list

**Check Network:**
- POST `/api/teams/{teamId}/members` returns 201

#### Test 6.3: View Team Members
**Steps:**
1. Open team details
2. View members list

**Expected:**
- ✅ All members displayed
- ✅ Roles shown correctly

**Check Network:**
- GET `/api/teams/{teamId}/members?userId=...` returns 200

#### Test 6.4: Remove Team Member
**Steps:**
1. Click remove on a member
2. Confirm

**Expected:**
- ✅ Member removed
- ✅ List updated

**Check Network:**
- DELETE `/api/teams/{teamId}/members/{userId}?requesterId=...` returns 204

---

### 🎨 7. UI/UX Features

#### Test 7.1: Dark Mode Toggle (If Implemented)
**Steps:**
1. Find dark mode toggle
2. Click to switch themes

**Expected:**
- ✅ Theme changes immediately
- ✅ Preference saved
- ✅ Persists on refresh

#### Test 7.2: Responsive Design
**Steps:**
1. Resize browser window
2. Test mobile view (400px width)
3. Test tablet view (768px width)

**Expected:**
- ✅ Layout adapts to screen size
- ✅ No horizontal scroll
- ✅ All features accessible

#### Test 7.3: Notifications/Toasts
**Steps:**
1. Perform various actions (create, update, delete)
2. Observe notifications

**Expected:**
- ✅ Success messages for successful actions
- ✅ Error messages for failures
- ✅ Notifications auto-dismiss

---

### 🔄 8. Real-time Updates (SignalR)

#### Test 8.1: Timer Updates
**Steps:**
1. Start a timer
2. Open another browser tab/window
3. Navigate to same account

**Expected:**
- ✅ Timer synced across tabs
- ✅ Both show same time
- ✅ Stop in one tab stops in other

**Check:**
- WebSocket connection established
- Console shows SignalR messages

---

### 🐛 9. Error Handling

#### Test 9.1: Network Errors
**Steps:**
1. Stop backend server
2. Try to perform actions in frontend

**Expected:**
- ✅ Error messages displayed
- ✅ App doesn't crash
- ✅ Can retry when backend back online

#### Test 9.2: Invalid Data
**Steps:**
1. Try to create task with empty title
2. Try to create project with empty name

**Expected:**
- ✅ Validation errors shown
- ✅ Prevents submission
- ✅ Clear error messages

---

### 📋 10. Data Persistence

#### Test 10.1: Refresh Page
**Steps:**
1. Perform some actions (create tasks, start timer)
2. Refresh page (F5)

**Expected:**
- ✅ User still logged in
- ✅ Data persists
- ✅ Timer state maintained (if running)

#### Test 10.2: Logout/Login
**Steps:**
1. Logout
2. Login again

**Expected:**
- ✅ Previous data still visible
- ✅ No data loss

---

## 🎯 Performance Checks

### Load Time
- Initial page load < 3 seconds
- Route navigation < 500ms
- API calls < 1 second

### Browser Console
- No errors in console
- No memory leaks (check Memory tab)
- No 404s for resources

### Network
- API calls efficient (no excessive polling)
- WebSocket connected (if using SignalR)
- No failed requests

---

## 📝 Reporting Issues

When you find a bug, note:

1. **What you did** (steps to reproduce)
2. **What happened** (actual result)
3. **What should happen** (expected result)
4. **Browser console errors** (screenshot or copy)
5. **Network tab** (failed requests)
6. **Screenshots** (if UI issue)

---

## ✅ Test Completion Checklist

Mark completed tests:

- [ ] Authentication & Login
- [ ] Dashboard & Stats
- [ ] Project Management (CRUD)
- [ ] Task Management (CRUD)
- [ ] Time Tracking (Start/Stop/Edit/Delete)
- [ ] Team Management (Create/Add/Remove)
- [ ] Dark Mode Toggle
- [ ] Responsive Design
- [ ] Real-time Updates
- [ ] Error Handling
- [ ] Data Persistence
- [ ] Performance

---

## 🚀 Quick Test Script

For rapid testing, run this sequence:

```
1. Login → Dev Login
2. Create Project → "Test Project"
3. Create Task → "Test Task" in project
4. Start Timer → Select task + project
5. Wait 10 seconds
6. Stop Timer
7. Check Timeline → Verify entry
8. Check Stats → Verify time recorded
9. Edit Task → Change status
10. Delete Task → Confirm deletion
11. Delete Project → Confirm deletion
```

Good luck testing! 🎉
