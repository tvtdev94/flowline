import { useEffect, useState } from 'react';
import Timeline from './components/Timeline/Timeline';
import TaskControls from './components/Controls/TaskControls';
import { useTaskStore } from './store/taskStore';
import { useTimerStore } from './store/timerStore';
import { useSignalR } from './hooks/useSignalR';
import { TaskStatus } from './types/task';
import './App.css';

// Demo user ID (in production, this would come from authentication)
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

function App() {
  const { tasks, fetchTasks } = useTaskStore();
  const { timeEntries, fetchTimeEntries } = useTimerStore();
  const [currentDate] = useState(new Date());

  // Connect to SignalR for real-time timer updates
  useSignalR(DEMO_USER_ID);

  // Fetch tasks and time entries on mount
  useEffect(() => {
    fetchTasks(DEMO_USER_ID);
    fetchTimeEntries(DEMO_USER_ID, currentDate);
  }, [fetchTasks, fetchTimeEntries, currentDate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">FLOWLINE</h1>
          <p className="text-sm text-gray-600 mt-1">
            Timeline Task Tracker with Real-time Visualization
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
        </div>

        {/* Task Controls */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Tasks</h3>
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskControls key={task.id} task={task} userId={DEMO_USER_ID} />)
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">
                  No tasks found. Create your first task to get started!
                </p>
                <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
                      userId: DEMO_USER_ID,
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
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
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

        {/* Stats Panel Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          <p className="text-gray-600 text-sm">
            Stats panel coming soon - will show daily time breakdown and pie charts by project
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>FLOWLINE MVP - Phase 2 Implementation</p>
          <p className="mt-1">Real-time Timeline Task Tracker</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
