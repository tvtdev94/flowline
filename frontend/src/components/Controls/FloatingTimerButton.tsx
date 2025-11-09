import { useState } from 'react';
import { useTimerStore } from '../../store/timerStore';
import { useTaskStore } from '../../store/taskStore';
import toast from 'react-hot-toast';

interface FloatingTimerButtonProps {
  userId: string;
  onNewTask: () => void;
}

/**
 * Floating action button for quick timer control
 * Positioned at bottom-right on mobile
 * Shows pulsing animation when timer is running
 */
export default function FloatingTimerButton({ userId, onNewTask }: FloatingTimerButtonProps) {
  const { runningTimers, startTimer, stopTimer } = useTimerStore();
  const { tasks } = useTaskStore();
  const [showMenu, setShowMenu] = useState(false);

  const hasRunningTimer = runningTimers.size > 0;
  const firstRunningTimer = runningTimers.size > 0 ? Array.from(runningTimers.values())[0] : null;
  const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null;

  const handleQuickAction = async () => {
    if (hasRunningTimer && firstRunningTimer) {
      // Stop the running timer
      await stopTimer(firstRunningTimer.id);
      toast.success('Timer stopped');
      setShowMenu(false);
    } else if (lastTask) {
      // Start timer on last task
      await startTimer(lastTask.id, userId);
      toast.success(`Timer started on "${lastTask.title}"`);
      setShowMenu(false);
    } else {
      // No tasks - show menu to create new task
      setShowMenu(!showMenu);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
        {/* Quick menu */}
        {showMenu && !hasRunningTimer && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => {
                onNewTask();
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-3 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">New Task</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create & start timer</p>
              </div>
            </button>
            {lastTask && (
              <button
                onClick={async () => {
                  await startTimer(lastTask.id, userId);
                  toast.success(`Timer started on "${lastTask.title}"`);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-3 mt-1 transition-colors"
              >
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Resume Last</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{lastTask.title}</p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Main button */}
        <button
          onClick={handleQuickAction}
          className={`
            w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${
              hasRunningTimer
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400 animate-pulse-subtle'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400 hover:scale-110'
            }
          `}
          title={hasRunningTimer ? 'Stop timer (Cmd/Ctrl+S)' : 'Quick timer (Cmd/Ctrl+T)'}
        >
          {hasRunningTimer ? (
            // Stop icon
            <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            // Play icon
            <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Timer count badge */}
        {runningTimers.size > 1 && (
          <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
            {runningTimers.size}
          </div>
        )}
      </div>

      {/* Backdrop when menu is open */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            opacity: 0.9;
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
