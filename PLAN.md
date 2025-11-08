# 🎯 FLOWLINE MVP - Technical Plan

## Product Overview

**FLOWLINE** - Timeline Task Tracker with Real-time Visualization

A time tracking application that visualizes tasks as horizontal bars on a timeline (Gantt-style), showing exactly how time is spent throughout the day. Tasks auto-layout into lanes without overlapping, with live timers and interactive controls.

---

## 1. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              USER (Browser)                     │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTPS
                  ↓
┌─────────────────────────────────────────────────┐
│         NGINX (Reverse Proxy)                   │
│  - Route /api → Backend                         │
│  - Route /    → Frontend                        │
└──────────┬──────────────────┬───────────────────┘
           │                  │
           ↓                  ↓
┌──────────────────┐  ┌──────────────────────────┐
│  FRONTEND        │  │  BACKEND                 │
│  React + Vite    │  │  .NET 8 Web API          │
│  TypeScript      │  │  + SignalR Hub           │
│  Port 3000       │  │  Port 5000               │
└──────────────────┘  └──────────┬───────────────┘
                                 │
                                 │ EF Core
                                 ↓
                      ┌──────────────────────────┐
                      │  PostgreSQL Database     │
                      │  Port 5432               │
                      └──────────────────────────┘
```

### Docker Compose Setup

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]

  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment:
      - ConnectionStrings__DefaultConnection=...
      - Google__ClientId=...
      - Google__ClientSecret=...
    depends_on: [postgres]

  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## 2. Tech Stack

### Backend (.NET 8)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | .NET 8.0 | Web API framework |
| Architecture | Clean Architecture | Separation of concerns |
| ORM | Entity Framework Core 8 | Database access |
| Database | PostgreSQL 16 | Primary data store |
| Real-time | SignalR | Live timer updates |
| Auth | Google OAuth 2.0 | Authentication |
| Validation | FluentValidation | Input validation |
| Mapping | AutoMapper | DTO mapping |
| API Docs | Swagger/OpenAPI | API documentation |

**Project Structure:**
```
Flowline.Backend/
├── Flowline.Api/              # Web API layer
├── Flowline.Application/      # Business logic, DTOs, Interfaces
├── Flowline.Domain/           # Entities, Value Objects
├── Flowline.Infrastructure/   # EF Core, External services
└── Flowline.Tests/            # Unit + Integration tests
```

### Frontend (React)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 | UI library |
| Build Tool | Vite 5 | Fast build & HMR |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| State | Zustand | Lightweight state management |
| API Client | Axios | HTTP client |
| Real-time | @microsoft/signalr | SignalR client |
| Timeline | Custom SVG + React | Timeline visualization |
| Drag & Drop | react-rnd | Draggable/resizable tasks |
| Charts | Recharts | Pie charts for stats |
| Date/Time | date-fns | Date manipulation |
| Auth | react-oauth/google | Google OAuth UI |

**Project Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── Timeline/          # Timeline visualization
│   │   ├── TaskBar/           # Individual task bars
│   │   ├── StatsPanel/        # Charts & statistics
│   │   └── Controls/          # Start/Stop/Edit controls
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API client, SignalR
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript types
│   └── utils/                 # Helper functions
```

---

## 3. Task Workflow (TODO → Track → Visualize)

### Overview

FLOWLINE uses a **TODO-first approach**: Create tasks as planning items, then start tracking when you begin working.

### Task Lifecycle

```
1. CREATE TASK (Todo State)
   ┌─────────────────────────┐
   │  Task Created           │
   │  - Title, Description   │
   │  - Status: Active       │
   │  - No TimeEntry yet     │
   └─────────────────────────┘
            │
            │ User clicks "Start" button
            ↓
2. START TIMER
   ┌─────────────────────────┐
   │  TimeEntry Created      │
   │  - StartTime = Now()    │
   │  - EndTime = null       │
   │  - Timer running        │
   └─────────────────────────┘
            │
            │ User clicks "Stop" button
            ↓
3. STOP TIMER
   ┌─────────────────────────┐
   │  TimeEntry Completed    │
   │  - EndTime = Now()      │
   │  - Duration calculated  │
   │  - Timeline bar visible │
   └─────────────────────────┘
            │
            │ Can start again (new session)
            ↓
4. MULTIPLE SESSIONS
   ┌─────────────────────────┐
   │  Task has multiple      │
   │  TimeEntry records:     │
   │  - Session 1: 9-11am    │
   │  - Session 2: 2-5pm     │
   │  - Total: 5 hours       │
   └─────────────────────────┘
```

### Key Features

**1. Task as TODO:**
- User creates tasks ahead of time (planning mode)
- Tasks exist without TimeEntry (not tracked yet)
- Can organize tasks by project, add descriptions

**2. On-Demand Time Tracking:**
- Click "Start" → Creates TimeEntry with `StartTime = DateTime.UtcNow`
- Timer runs in real-time (SignalR updates every 1s)
- Click "Stop" → Sets `EndTime = DateTime.UtcNow`

**3. Multiple Work Sessions:**
- Same task can be started/stopped multiple times
- Each session = 1 TimeEntry record
- Timeline shows all sessions as separate bars (with same task color)

**4. Timeline Visualization:**
- Only tasks **with TimeEntry** appear on timeline
- Each TimeEntry = one horizontal bar
- Auto-layout in lanes (no overlap)

### API Workflow

```typescript
// 1. Create Task (TODO)
POST /api/tasks
Body: { userId, title, description, color, status: "Active" }
→ Returns: { id, createdAt }

// 2. Start Timer
POST /api/time-entries/start
Body: { taskId }
→ Creates TimeEntry with StartTime = now
→ Returns: { id, taskId, startTime }

// 3. Stop Timer
POST /api/time-entries/stop/{timeEntryId}
→ Updates TimeEntry with EndTime = now
→ Returns: { id, duration }

// 4. Get Timeline (shows only tracked tasks)
GET /api/timeline?userId={id}&date={date}
→ Returns: List<TimeEntry> with Task info
```

---

## 4. Database Schema

### Entity Diagram (with Team Collaboration)

```
┌──────────────────┐
│      Users       │
├──────────────────┤
│ Id (PK)          │
│ GoogleId         │
│ Email            │
│ Name             │
│ Picture          │
│ CreatedAt        │
│ LastLoginAt      │
└────┬─────┬───────┘
     │     │
     │     │ N:M (via TeamMembers)
     │     ↓
     │   ┌──────────────────┐         ┌──────────────────┐
     │   │  TeamMembers     │←────────│      Teams       │
     │   ├──────────────────┤         ├──────────────────┤
     │   │ Id (PK)          │         │ Id (PK)          │
     │   │ TeamId (FK)      │    1:N  │ Name             │
     │   │ UserId (FK)      │────────→│ OwnerId (FK)     │
     │   │ Role             │         │ CreatedAt        │
     │   │ JoinedAt         │         └──────────────────┘
     │   └──────────────────┘
     │
     │ 1:N (personal tasks)
     ↓
┌──────────────────┐
│      Tasks       │
├──────────────────┤
│ Id (PK)          │
│ UserId (FK)      │
│ TeamId (FK)      │ ← nullable (personal tasks have null)
│ ProjectId (FK)   │
│ Title            │
│ Description      │
│ Color            │
│ Status           │ ← enum: Active, Paused, Stuck, Done
│ IsPrivate        │ ← bool (hide from team if true)
│ CreatedAt        │
└────┬─────────────┘
     │
     │ 1:N
     ↓
┌──────────────────┐
│   TimeEntries    │
├──────────────────┤
│ Id (PK)          │
│ TaskId (FK)      │
│ StartTime        │
│ EndTime          │ ← nullable (null = running)
│ Duration         │ ← computed
│ Notes            │
│ CreatedAt        │
└──────────────────┘
```

### Team Collaboration Features

**Team Roles:**
- **Owner**: Can manage team, invite/remove members, view all activity
- **Member**: Can see team tasks, share own work with team

**Visibility Rules:**
- Personal tasks (TeamId = null): Only visible to task owner
- Team tasks (TeamId != null): Visible to all team members
- Private team tasks (IsPrivate = true): Visible only to owner, hidden from team
- Manager view: Owner can see all team members' current activity (running timers)

**Use Cases:**
1. **Freelancer solo**: Works with personal tasks only
2. **Team member**: Belongs to team(s), shares some tasks with team
3. **Manager**: Creates team, invites members, monitors team progress

### Key Entities

**User**
- GoogleId: Unique identifier from Google OAuth
- Email: User's email
- Name, Picture: Profile info
- Can belong to multiple teams

**Team**
- OwnerId: Creator/manager of the team
- Name: Team name
- Members: List of users via TeamMembers junction table

**TeamMember**
- Junction table for User <-> Team relationship
- Role: "Owner" or "Member"
- JoinedAt: When user joined the team
- Allows N:M relationship (user can be in multiple teams)

**Project**
- Optional grouping for tasks
- Custom color per project
- Stats aggregation by project

**Task**
- Title, Description
- TeamId: null for personal tasks, set for team-shared tasks
- IsPrivate: If true, hide from team (only owner sees)
- UserId: Task owner (who created it)
- Custom color (or inherit from Project)
- Status: Active, Paused, Stuck, Done
- Multiple TimeEntries per Task

**TimeEntry**
- Represents one continuous work session
- StartTime: When timer started
- EndTime: When timer stopped (null if running)
- Duration: Calculated field (EndTime - StartTime)
- Notes: Optional notes for the work session

---

## 4. API Design

### REST Endpoints

#### Authentication
```
POST   /api/auth/google              # Google OAuth login
POST   /api/auth/refresh             # Refresh JWT token
POST   /api/auth/logout              # Logout
GET    /api/auth/me                  # Get current user
```

#### Tasks
```
GET    /api/tasks                    # List all tasks (with filters)
GET    /api/tasks/{id}               # Get task by ID
POST   /api/tasks                    # Create new task
PUT    /api/tasks/{id}               # Update task
DELETE /api/tasks/{id}               # Delete task
PATCH  /api/tasks/{id}/status        # Update task status
```

#### Time Entries
```
GET    /api/time-entries             # List time entries (date range)
POST   /api/time-entries/start       # Start timer for a task
POST   /api/time-entries/stop        # Stop current timer
PUT    /api/time-entries/{id}        # Adjust time entry (drag-to-adjust)
DELETE /api/time-entries/{id}        # Delete time entry
```

#### Projects
```
GET    /api/projects                 # List projects
POST   /api/projects                 # Create project
PUT    /api/projects/{id}            # Update project
DELETE /api/projects/{id}            # Delete project
```

#### Stats
```
GET    /api/stats/daily              # Daily time breakdown
GET    /api/stats/weekly             # Weekly summary
GET    /api/stats/by-project         # Time by project (for pie chart)
```

### SignalR Hub

**Hub Name:** `TimerHub`

**Client → Server Methods:**
```typescript
JoinTimerGroup(userId: string)       // Subscribe to user's timer updates
LeaveTimerGroup(userId: string)      // Unsubscribe
```

**Server → Client Events:**
```typescript
OnTimerTick(timeEntry: TimeEntry)    // Every 1 second, update running timer
OnTimerStarted(timeEntry: TimeEntry) // New timer started
OnTimerStopped(timeEntry: TimeEntry) // Timer stopped
OnTaskUpdated(task: Task)            // Task modified
```

---

## 5. Core Features Implementation

### 5.1 Timeline Auto-Layout Algorithm

**Challenge:** Multiple tasks in a day must not overlap visually.

**Solution:** Lane-based layout algorithm

```typescript
interface TimelineTask {
  id: string;
  startTime: Date;
  endTime: Date | null; // null = running
  lane: number; // Auto-assigned
}

function assignLanes(tasks: TimelineTask[]): void {
  // Sort by start time
  const sorted = tasks.sort((a, b) =>
    a.startTime.getTime() - b.startTime.getTime()
  );

  const lanes: { endTime: Date | null }[] = [];

  for (const task of sorted) {
    // Find first available lane
    let assignedLane = -1;

    for (let i = 0; i < lanes.length; i++) {
      if (!lanes[i].endTime || lanes[i].endTime! <= task.startTime) {
        assignedLane = i;
        break;
      }
    }

    // If no lane available, create new one
    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push({ endTime: null });
    }

    // Assign task to lane
    task.lane = assignedLane;
    lanes[assignedLane].endTime = task.endTime || new Date(); // Use current time if running
  }
}
```

**Result:**
- Tasks automatically stack in lanes
- No overlap
- Minimal lane count
- O(n²) complexity (acceptable for daily tasks < 100)

### 5.2 Live Timer (Real-time)

**Frontend:**
```typescript
// SignalR connection
const connection = new HubConnectionBuilder()
  .withUrl('/hubs/timer')
  .build();

connection.on('OnTimerTick', (entry: TimeEntry) => {
  // Update UI every second
  updateTaskDuration(entry.taskId, entry.duration);
});

// Local interval as backup (if SignalR disconnects)
setInterval(() => {
  const runningTasks = store.getRunningTasks();
  runningTasks.forEach(task => {
    task.duration += 1; // Increment 1 second
  });
}, 1000);
```

**Backend:**
```csharp
public class TimerHub : Hub
{
    private readonly ITimer _timer;

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User.GetUserId();
        await Groups.AddToGroupAsync(Context.ConnectionId, userId);

        // Start background timer for this user
        _timer.StartForUser(userId);
    }

    // Background service sends tick every second
    public async Task BroadcastTimerTick(string userId, TimeEntry entry)
    {
        await Clients.Group(userId).SendAsync("OnTimerTick", entry);
    }
}
```

### 5.3 Drag to Adjust Time

**Using react-rnd:**
```typescript
<Rnd
  position={{ x: getXPosition(task.startTime), y: task.lane * LANE_HEIGHT }}
  size={{ width: getDuration(task), height: LANE_HEIGHT }}
  onDragStop={(e, data) => {
    // Calculate new start time from X position
    const newStartTime = getTimeFromX(data.x);
    updateTaskStartTime(task.id, newStartTime);
  }}
  onResizeStop={(e, direction, ref, delta, position) => {
    // Calculate new duration from width
    const newDuration = getWidthInMinutes(ref.style.width);
    updateTaskDuration(task.id, newDuration);
  }}
>
  <TaskBar task={task} />
</Rnd>
```

**API Call:**
```typescript
async function updateTaskStartTime(taskId: string, newStartTime: Date) {
  await api.put(`/api/time-entries/${taskId}`, {
    startTime: newStartTime
  });
}
```

### 5.4 Zoom & Pan Timeline

**Using react-zoom-pan-pinch:**
```typescript
<TransformWrapper
  initialScale={1}
  minScale={0.5}
  maxScale={4}
>
  {({ zoomIn, zoomOut, resetTransform }) => (
    <>
      <TransformComponent>
        <Timeline tasks={tasks} />
      </TransformComponent>

      <Controls>
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
        <button onClick={resetTransform}>Reset</button>
      </Controls>
    </>
  )}
</TransformWrapper>
```

### 5.5 Task Status Badges

**Enum:**
```csharp
public enum TaskStatus
{
    Active,   // Green - Currently working
    Paused,   // Yellow - Temporarily stopped
    Stuck,    // Red - Blocked
    Done      // Gray - Completed
}
```

**UI Badge:**
```typescript
const STATUS_COLORS = {
  Active: 'bg-green-500',
  Paused: 'bg-yellow-500',
  Stuck: 'bg-red-500',
  Done: 'bg-gray-500'
};

<span className={`badge ${STATUS_COLORS[task.status]}`}>
  {task.status}
</span>
```

### 5.6 Stats Panel with Pie Chart

**Data Aggregation (Backend):**
```csharp
public async Task<StatsDto> GetDailyStats(DateTime date, string userId)
{
    var entries = await _context.TimeEntries
        .Include(e => e.Task)
        .ThenInclude(t => t.Project)
        .Where(e => e.Task.UserId == userId
                 && e.StartTime.Date == date.Date)
        .ToListAsync();

    var byProject = entries
        .GroupBy(e => e.Task.Project?.Name ?? "No Project")
        .Select(g => new ProjectTimeDto
        {
            ProjectName = g.Key,
            TotalMinutes = g.Sum(e => e.Duration.TotalMinutes),
            Color = g.First().Task.Project?.Color
        })
        .ToList();

    return new StatsDto
    {
        TotalMinutes = entries.Sum(e => e.Duration.TotalMinutes),
        ByProject = byProject
    };
}
```

**Frontend Pie Chart:**
```typescript
import { PieChart, Pie, Cell } from 'recharts';

<PieChart width={300} height={300}>
  <Pie
    data={stats.byProject}
    dataKey="totalMinutes"
    nameKey="projectName"
    cx="50%"
    cy="50%"
    outerRadius={80}
  >
    {stats.byProject.map((entry, index) => (
      <Cell key={index} fill={entry.color} />
    ))}
  </Pie>
</PieChart>
```

---

## 6. Google OAuth Authentication Flow

### 6.1 Flow Diagram

```
┌────────┐                ┌──────────┐              ┌─────────┐
│ Client │                │ Backend  │              │ Google  │
└───┬────┘                └────┬─────┘              └────┬────┘
    │                          │                         │
    │ Click "Login with Google"│                         │
    ├─────────────────────────>│                         │
    │                          │                         │
    │  Redirect to Google      │                         │
    │<─────────────────────────┤                         │
    │                          │                         │
    │         OAuth flow (handled by Google)             │
    │<─────────────────────────────────────────────────> │
    │                          │                         │
    │ Callback with auth code  │                         │
    ├─────────────────────────>│                         │
    │                          │                         │
    │                          │  Exchange code for token│
    │                          ├────────────────────────>│
    │                          │                         │
    │                          │  User profile + token   │
    │                          │<────────────────────────┤
    │                          │                         │
    │                          │ Create/Update User in DB│
    │                          │                         │
    │  JWT token + user info   │                         │
    │<─────────────────────────┤                         │
    │                          │                         │
```

### 6.2 Backend Implementation

**appsettings.json:**
```json
{
  "Google": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID",
    "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
  },
  "Jwt": {
    "Secret": "YOUR_JWT_SECRET_KEY_MIN_32_CHARS",
    "Issuer": "flowline-api",
    "Audience": "flowline-app",
    "ExpiryMinutes": 60
  }
}
```

**Startup.cs:**
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Secret"]))
        };
    });
```

**AuthController.cs:**
```csharp
[HttpPost("google")]
public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
{
    // Verify Google token
    var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);

    // Find or create user
    var user = await _userRepository.GetByGoogleId(payload.Subject)
               ?? await CreateUserFromGoogle(payload);

    // Generate JWT
    var token = _jwtService.GenerateToken(user);

    return Ok(new AuthResponse
    {
        Token = token,
        User = _mapper.Map<UserDto>(user)
    });
}
```

### 6.3 Frontend Implementation

```typescript
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <LoginPage />
    </GoogleOAuthProvider>
  );
}

function LoginPage() {
  const handleLoginSuccess = async (credentialResponse) => {
    const { data } = await axios.post('/api/auth/google', {
      idToken: credentialResponse.credential
    });

    // Store JWT
    localStorage.setItem('token', data.token);

    // Redirect to app
    navigate('/dashboard');
  };

  return (
    <GoogleLogin
      onSuccess={handleLoginSuccess}
      onError={() => console.error('Login failed')}
    />
  );
}
```

---

## 7. Development Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Basic infrastructure + authentication

**Backend:**
- [x] Setup .NET 8 project (Clean Architecture)
- [x] Configure PostgreSQL + EF Core
- [x] Create initial migrations (User, Project, Task, TimeEntry)
- [x] Implement Google OAuth authentication
- [x] Setup JWT middleware
- [x] Basic CRUD endpoints for Tasks

**Frontend:**
- [x] Setup React + Vite + TypeScript
- [x] Configure Tailwind CSS
- [x] Setup Zustand store
- [x] Implement Google login UI
- [x] API client with Axios
- [x] Protected routes

**DevOps:**
- [x] Docker Compose setup
- [x] Environment variables
- [x] Database migrations in Docker

**Deliverable:**
- Login with Google works
- Can create/list tasks via API
- Docker Compose runs all services

---

### Phase 2: Core Features (Week 3-5)

**Goal:** Timeline visualization + live timer

**Backend:**
- [ ] SignalR Hub setup
- [ ] Timer background service
- [ ] Time Entry endpoints (start/stop/adjust)
- [ ] Stats aggregation endpoints
- [ ] WebSocket authentication

**Frontend:**
- [ ] Timeline component with SVG rendering
- [ ] Auto-layout algorithm implementation
- [ ] Task bars with colors
- [ ] Start/Stop/Pause controls
- [ ] SignalR client integration
- [ ] Live timer updates (1s interval)
- [ ] Basic responsive layout

**Deliverable:**
- Timeline shows tasks as horizontal bars
- Can start/stop timers
- Timer grows in real-time
- Auto-layout prevents overlap

---

### Phase 3: Interactions & Polish (Week 6-8)

**Goal:** Advanced interactions + stats

**Frontend:**
- [ ] Drag-to-adjust with react-rnd
- [ ] Zoom/pan timeline
- [ ] Click task to edit modal
- [ ] Task status badges
- [ ] Color picker for tasks/projects
- [ ] Stats panel with Recharts
- [ ] Pie chart by project
- [ ] Daily/weekly/monthly views
- [ ] Export to CSV

**Backend:**
- [ ] Optimistic locking for concurrent edits
- [ ] Bulk update endpoints
- [ ] Advanced filtering
- [ ] Performance optimization

**Polish:**
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Dark mode (optional)
- [ ] Mobile responsive
- [ ] Animations

**Deliverable:**
- Fully functional MVP
- All core features working
- Production-ready deployment

---

## 8. Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 2 weeks | Foundation + Auth |
| Phase 2 | 3 weeks | Timeline + Live Timer |
| Phase 3 | 3 weeks | Interactions + Polish |
| **Total** | **8 weeks** | **Full MVP** |

**Breakdown by Week:**

- **Week 1:** Backend setup, database, migrations
- **Week 2:** Google OAuth, basic API, frontend setup
- **Week 3:** SignalR, timer service
- **Week 4:** Timeline component, auto-layout
- **Week 5:** Live timer integration, basic UI
- **Week 6:** Drag-to-adjust, zoom/pan
- **Week 7:** Stats panel, charts
- **Week 8:** Polish, testing, deployment

**Note:** Bạn solo nên estimate x1.5 buffer cho debugging/learning = ~12 weeks total

---

## 9. Technical Decisions & Rationale

### Why .NET instead of Next.js?

1. **Developer expertise** - Bạn expert .NET, ít Next.js
2. **Productivity** - Code nhanh hơn 2-3x với tech quen thuộc
3. **Type safety** - C# + EF Core type-safe như TypeScript
4. **SignalR** - Best-in-class real-time framework
5. **Solo development** - Debugging .NET dễ hơn khi không có team

### Why PostgreSQL instead of SQL Server?

1. **Free & open-source**
2. **Docker-friendly** (official images)
3. **Cross-platform**
4. **EF Core support excellent**
5. **JSON columns** (future flexibility)

### Why Zustand instead of Redux?

1. **Simplicity** - Ít boilerplate
2. **TypeScript-first**
3. **Small bundle size** (~1KB)
4. **No Provider hell**
5. **DevTools support**

### Why react-rnd for drag?

1. **Mature library** (battle-tested)
2. **Both draggable & resizable**
3. **Touch support**
4. **Controlled components**

---

## 10. Folder Structure (Final)

```
flowline/
├── backend/
│   ├── Flowline.Api/
│   │   ├── Controllers/
│   │   ├── Hubs/              # SignalR hubs
│   │   ├── Middleware/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── Flowline.Application/
│   │   ├── DTOs/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   └── Validators/
│   ├── Flowline.Domain/
│   │   ├── Entities/
│   │   ├── Enums/
│   │   └── ValueObjects/
│   ├── Flowline.Infrastructure/
│   │   ├── Data/
│   │   │   ├── Migrations/
│   │   │   ├── Configurations/
│   │   │   └── ApplicationDbContext.cs
│   │   ├── Repositories/
│   │   └── Services/
│   └── Flowline.Tests/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Timeline/
│   │   │   │   ├── Timeline.tsx
│   │   │   │   ├── TaskBar.tsx
│   │   │   │   ├── TimeAxis.tsx
│   │   │   │   └── AutoLayout.ts
│   │   │   ├── StatsPanel/
│   │   │   │   ├── StatsPanel.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   └── Summary.tsx
│   │   │   ├── Controls/
│   │   │   │   ├── TaskControls.tsx
│   │   │   │   ├── TimerButton.tsx
│   │   │   │   └── ZoomControls.tsx
│   │   │   └── Auth/
│   │   │       ├── LoginPage.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSignalR.ts
│   │   │   ├── useTasks.ts
│   │   │   └── useTimer.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── signalr.ts
│   │   │   └── auth.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── taskStore.ts
│   │   │   └── timerStore.ts
│   │   ├── types/
│   │   │   ├── task.ts
│   │   │   ├── timeEntry.ts
│   │   │   └── api.ts
│   │   └── utils/
│   │       ├── timeCalculations.ts
│   │       └── colors.ts
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 11. Environment Variables

**`.env` (Backend):**
```env
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=flowline
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# JWT
JWT_SECRET=your_jwt_secret_min_32_characters_long
JWT_ISSUER=flowline-api
JWT_AUDIENCE=flowline-app
JWT_EXPIRY_MINUTES=60

# Environment
ASPNETCORE_ENVIRONMENT=Development
```

**`.env` (Frontend):**
```env
VITE_API_URL=http://localhost:5000
VITE_SIGNALR_HUB_URL=http://localhost:5000/hubs/timer
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## 12. Next Steps

### Immediate (Phase 1 Start):

1. **Setup Projects:**
   - [ ] Create .NET solution with Clean Architecture
   - [ ] Initialize React app (already done)
   - [ ] Setup PostgreSQL Docker container

2. **Database:**
   - [ ] Design Entity classes
   - [ ] Configure EF Core DbContext
   - [ ] Create initial migration

3. **Authentication:**
   - [ ] Setup Google OAuth credentials (Google Cloud Console)
   - [ ] Implement JWT service
   - [ ] Create auth endpoints

4. **Frontend:**
   - [ ] Install dependencies (Tailwind, Zustand, etc.)
   - [ ] Setup routing
   - [ ] Create login page

### Questions Before Starting:

1. ✅ Tech stack confirmed? (.NET 8 + React + PostgreSQL + Docker)
2. ✅ Google OAuth approach approved?
3. ✅ Timeline estimate realistic? (8-12 weeks)
4. ✅ Clean Architecture for backend OK?
5. ✅ Component structure for frontend make sense?

---

## 13. Success Metrics (MVP v1)

**Must Have:**
- [ ] User can login with Google
- [ ] User can create tasks
- [ ] User can start/stop timers
- [ ] Timeline shows tasks as bars
- [ ] Auto-layout prevents overlap
- [ ] Live timer updates every second
- [ ] Basic stats (total time per day)
- [ ] Docker deployment works

**Nice to Have (Phase 3):**
- [ ] Drag to adjust time
- [ ] Zoom/pan timeline
- [ ] Pie chart by project
- [ ] Export to CSV
- [ ] Mobile responsive

---

**READY TO START?**

Bạn review plan này và cho feedback:
1. Có gì cần adjust không?
2. Database schema có thiếu field nào?
3. API endpoints có đủ không?
4. Timeline estimate có realistic không?

Khi bạn approve, tôi sẽ bắt đầu implement Phase 1! 🚀
