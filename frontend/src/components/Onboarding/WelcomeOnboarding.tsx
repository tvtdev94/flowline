import { useState, useEffect } from 'react';

/**
 * Welcome onboarding flow for new users
 * Shows feature highlights and quick tour
 * Displayed only on first visit (stored in localStorage)
 */
export default function WelcomeOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('flowline_onboarding_completed');
    if (!hasSeenOnboarding) {
      // Delay to let page load first
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('flowline_onboarding_completed', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('flowline_onboarding_completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Flowline! 🎉',
      description: 'Your visual timeline task tracker with real-time updates',
      image: '📊',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Flowline helps you track time visually on a timeline, so you can see exactly where your time goes.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">⏱️</div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Timer Tracking</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Start/stop timers on tasks</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Visual Timeline</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">See your day at a glance</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Team Collaboration</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Share tasks with teams</p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Statistics</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Track your productivity</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Create Your First Task',
      description: 'Tasks are the foundation of time tracking',
      image: '✅',
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">How to create a task:</p>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Click the <strong>"New Task"</strong> button in the header</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Give it a name and choose a color</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Optionally add to a project or team</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Click "Create" and start tracking!</span>
              </li>
            </ol>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Pro tip:</strong> Use keyboard shortcut <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">Cmd/Ctrl+N</kbd> to quickly create tasks
          </p>
        </div>
      ),
    },
    {
      title: 'Track Time Visually',
      description: 'See your time on an interactive timeline',
      image: '⏱️',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 text-center">
            The timeline shows exactly when you worked and for how long.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                ▶
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Start Timer</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Click "Start" on any task to begin tracking time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">
                ⏹
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Stop Timer</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Click "Stop" when you're done. Time entry appears on timeline!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                ↔
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Drag to Adjust</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Drag time bars on timeline to adjust start/end times
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Keyboard Shortcuts',
      description: 'Work faster with keyboard shortcuts',
      image: '⌨️',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Power users love keyboard shortcuts! Here are the essentials:
          </p>
          <div className="space-y-2">
            {[
              { keys: 'Cmd/Ctrl + T', action: 'Quick timer (start/resume)' },
              { keys: 'Cmd/Ctrl + S', action: 'Stop current timer' },
              { keys: 'Cmd/Ctrl + N', action: 'New task' },
              { keys: 'Esc', action: 'Close modals' },
              { keys: '?', action: 'Show all shortcuts' },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono">
                  {shortcut.keys}
                </kbd>
                <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.action}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">?</kbd> anytime to see all shortcuts
          </p>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 animate-in fade-in duration-300" />

      {/* Onboarding modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{currentStepData.image}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {currentStepData.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
              >
                Skip tour
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-blue-600'
                      : index < currentStep
                      ? 'w-2 bg-blue-400'
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStepData.content}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t dark:border-gray-700 rounded-b-2xl flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentStep + 1} of {steps.length}
            </span>

            {isLastStep ? (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started! 🚀
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
