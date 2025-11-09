import { useEffect, useRef, useState } from 'react';
import { useTimerStore } from '../store/timerStore';
import toast from 'react-hot-toast';

interface UseTimerNotificationsOptions {
  enabled?: boolean;
  hourlyReminder?: boolean; // Remind every hour
  idleDetection?: boolean; // Detect idle and warn
  idleThreshold?: number; // Minutes of idle before warning (default 30)
}

/**
 * Custom hook for timer notifications and idle detection
 *
 * Features:
 * - Browser notifications for running timers
 * - Hourly reminders ("Timer running for X hours")
 * - Idle detection ("Still working?")
 * - Favicon badge count
 */
export const useTimerNotifications = (options: UseTimerNotificationsOptions = {}) => {
  const {
    enabled = true,
    hourlyReminder = true,
    idleDetection = true,
    idleThreshold = 30, // 30 minutes
  } = options;

  const { runningTimers } = useTimerStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const lastActivityRef = useRef<number>(Date.now());
  const notificationTimersRef = useRef<Map<string, number>>(new Map());

  // Request notification permission
  useEffect(() => {
    if (!enabled || !('Notification' in window)) return;

    setPermission(Notification.permission);

    if (Notification.permission === 'default') {
      // Show toast to request permission
      toast((t) => (
        <div>
          <p className="font-medium">Enable timer notifications?</p>
          <p className="text-sm text-gray-600 mt-1">
            Get reminded when your timer is running for too long
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                Notification.requestPermission().then((perm) => {
                  setPermission(perm);
                  if (perm === 'granted') {
                    toast.success('Notifications enabled!');
                  }
                });
                toast.dismiss(t.id);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Enable
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Not now
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    }
  }, [enabled]);

  // Track user activity for idle detection
  useEffect(() => {
    if (!enabled || !idleDetection) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Track mouse and keyboard activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [enabled, idleDetection]);

  // Monitor running timers and send notifications
  useEffect(() => {
    if (!enabled || permission !== 'granted') return;

    const checkTimers = setInterval(() => {
      const now = Date.now();
      const idleTime = (now - lastActivityRef.current) / 1000 / 60; // minutes

      runningTimers.forEach((entry, taskId) => {
        if (!entry.startTime) return;

        const startTime = new Date(entry.startTime).getTime();
        const elapsedMinutes = (now - startTime) / 1000 / 60;
        const elapsedHours = Math.floor(elapsedMinutes / 60);

        // Hourly reminder
        if (hourlyReminder && elapsedMinutes > 60 && elapsedMinutes % 60 < 1) {
          const lastNotification = notificationTimersRef.current.get(taskId);
          if (!lastNotification || now - lastNotification > 55 * 60 * 1000) {
            // Send notification
            const notification = new Notification('Timer Running', {
              body: `Your timer has been running for ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}`,
              icon: '/vite.svg',
              tag: `timer-${taskId}`,
              requireInteraction: false,
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            notificationTimersRef.current.set(taskId, now);
          }
        }

        // Idle detection warning
        if (idleDetection && idleTime >= idleThreshold && elapsedMinutes > idleThreshold) {
          const lastNotification = notificationTimersRef.current.get(`idle-${taskId}`);
          if (!lastNotification || now - lastNotification > idleThreshold * 60 * 1000) {
            const notification = new Notification('Are you still working?', {
              body: `You've been idle for ${Math.floor(idleTime)} minutes. Timer still running.`,
              icon: '/vite.svg',
              tag: `idle-${taskId}`,
              requireInteraction: true,
              actions: [
                { action: 'stop', title: 'Stop Timer' },
                { action: 'continue', title: 'Still Working' },
              ],
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            notificationTimersRef.current.set(`idle-${taskId}`, now);
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkTimers);
  }, [enabled, permission, runningTimers, hourlyReminder, idleDetection, idleThreshold]);

  // Update favicon badge count
  useEffect(() => {
    const count = runningTimers.size;

    // Update page title
    if (count > 0) {
      document.title = `(${count}) Flowline - Timer Running`;
    } else {
      document.title = 'Flowline - Timeline Task Tracker';
    }

    // TODO: Update favicon with badge (requires canvas drawing or library)
    // For now, just updating title is sufficient
  }, [runningTimers.size]);

  return {
    permission,
    hasRunningTimers: runningTimers.size > 0,
    runningTimersCount: runningTimers.size,
  };
};
