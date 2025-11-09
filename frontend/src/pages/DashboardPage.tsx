import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Timeline from '../components/Timeline/Timeline';
import TaskControls from '../components/Controls/TaskControls';
import StatsPanel from '../components/StatsPanel/StatsPanel';
import CreateTaskModal from '../components/Controls/CreateTaskModal';
import ProjectManagementModal from '../components/Controls/ProjectManagementModal';
import TeamManagementModal from '../components/Controls/TeamManagementModal';
import ThemeToggle from '../components/Controls/ThemeToggle';
import { useTaskStore } from '../store/taskStore';
import { useTimerStore } from '../store/timerStore';
import { useTeamStore } from '../store/teamStore';
import { useSignalR } from '../hooks/useSignalR';
import { useAuthStore } from '../store/authStore';
import { TaskStatus } from '../types/task';
import { exportTimeEntriesToCSV } from '../utils/csvExport';
import '../App.css';

type ViewMode = 'personal' | 'team';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { timeEntries, fetchTimeEntries } = useTimerStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [timelineZoom, setTimelineZoom] = useState(100); // pixels per hour
  const { teams, fetchTeams } = useTeamStore();

  const userId = user?.id || '';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Connect to SignalR for real-time timer updates
  useSignalR(userId);

  // Fetch tasks and time entries on mount
  useEffect(() => {
    if (userId) {
      fetchTasks(userId);
      fetchTimeEntries(userId, currentDate);
    }
  }, [fetchTasks, fetchTimeEntries, currentDate, userId]);

  // Fetch teams when switching to team mode
  useEffect(() => {
    if (userId && viewMode === 'team') {
      fetchTeams(userId);
    }
  }, [userId, viewMode, fetchTeams]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setCurrentDate(newDate);
    }
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  const handleZoomIn = () => {
    setTimelineZoom((prev) => Math.min(prev + 25, 300)); // Max 300px per hour
  };

  const handleZoomOut = () => {
    setTimelineZoom((prev) => Math.max(prev - 25, 50)); // Min 50px per hour
  };

  const handleZoomReset = () => {
    setTimelineZoom(100);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">FLOWLINE</h1>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Timeline Task Tracker with Real-time Visualization
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              {/* Personal/Team Mode Switch */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('personal')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'personal'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setViewMode('team')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'team'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Team
                </button>
              </div>

              {/* New Task Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">New</span>
              </button>

              {/* Manage Projects Button */}
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="px-3 md:px-4 py-2 bg-gray-600 dark:bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-500 flex items-center gap-2 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="hidden sm:inline">Projects</span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2 md:gap-3 border-l dark:border-gray-600 pl-2 md:pl-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Team Mode Panel */}
        {viewMode === 'team' && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Team Collaboration Mode</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {teams.length === 0
                      ? "You're not part of any teams yet. Create or join a team to collaborate!"
                      : `You're part of ${teams.length} team${teams.length > 1 ? 's' : ''}. Manage your teams to view shared tasks.`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Teams
              </button>
            </div>
          </div>
        )}

        {/* Date Header with Navigation */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>

            <div className="flex items-center gap-2">
              {/* Previous Day Button */}
              <button
                onClick={goToPreviousDay}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Previous day"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Today Button */}
              <button
                onClick={goToToday}
                disabled={isToday}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isToday
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title="Go to today"
              >
                Today
              </button>

              {/* Next Day Button */}
              <button
                onClick={goToNextDay}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Next day"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Date Picker */}
              <input
                type="date"
                value={currentDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Select date"
              />
            </div>
          </div>
        </div>

        {/* Task Controls */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Tasks</h3>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskControls key={task.id} task={task} userId={userId} />)
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">
                  No tasks found. Create your first task to get started!
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            )}

            {/* Demo Task Button (for testing) */}
            {tasks.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Demo Mode:</strong> No tasks in database. You can create a demo task
                  to test the timeline visualization.
                </p>
                <button
                  onClick={() => {
                    const demoTask = {
                      id: 'demo-1',
                      userId: userId,
                      title: 'Demo Task - Backend Development',
                      description: 'Working on FLOWLINE backend API',
                      color: '#3b82f6',
                      status: TaskStatus.Active,
                      isPrivate: false,
                      createdAt: new Date().toISOString(),
                    };
                    useTaskStore.getState().addTask(demoTask);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Add Demo Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              {timeEntries.length > 0 && (
                <>
                  <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-2 py-1">
                    <button
                      onClick={handleZoomOut}
                      disabled={timelineZoom <= 50}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                      title="Zoom out"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-600 px-2 border-x border-gray-200">{Math.round((timelineZoom / 100) * 100)}%</span>
                    <button
                      onClick={handleZoomIn}
                      disabled={timelineZoom >= 300}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                      title="Zoom in"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleZoomReset}
                      className="ml-1 px-2 py-0.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      title="Reset zoom"
                    >
                      Reset
                    </button>
                  </div>
                  <button
                    onClick={() => exportTimeEntriesToCSV(timeEntries, currentDate)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
                    title="Export to CSV"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export to CSV
                  </button>
                </>
              )}
            </div>
          </div>
          {timeEntries.length > 0 ? (
            <Timeline timeEntries={timeEntries} date={currentDate} pixelsPerHour={timelineZoom} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">
                No time entries yet. Start a timer to see the timeline visualization.
              </p>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <StatsPanel userId={userId} date={currentDate} />
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        userId={userId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Project Management Modal */}
      <ProjectManagementModal
        userId={userId}
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        userId={userId}
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>FLOWLINE MVP - Phase 3 Implementation</p>
          <p className="mt-1">Real-time Timeline Task Tracker with Stats & Task Management</p>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPage;
