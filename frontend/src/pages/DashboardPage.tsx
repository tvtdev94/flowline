import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Timeline from '../components/Timeline/Timeline';
import TaskControls from '../components/Controls/TaskControls';
import StatsPanel from '../components/StatsPanel/StatsPanel';
import CreateTaskModal from '../components/Controls/CreateTaskModal';
import { useTaskStore } from '../store/taskStore';
import { useTimerStore } from '../store/timerStore';
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
  const [viewMode, setViewMode] = useState<ViewMode>('personal');

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FLOWLINE</h1>
              <p className="text-sm text-gray-600 mt-1">
                Timeline Task Tracker with Real-time Visualization
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Personal/Team Mode Switch */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('personal')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'personal'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
        {/* Team Mode Notice */}
        {viewMode === 'team' && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Team Mode</p>
                <p className="text-sm text-blue-700 mt-1">
                  Team collaboration features are coming soon. For now, you're viewing your personal tasks.
                </p>
              </div>
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
            {timeEntries.length > 0 && (
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
            )}
          </div>
          {timeEntries.length > 0 ? (
            <Timeline timeEntries={timeEntries} date={currentDate} />
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
