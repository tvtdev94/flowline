import { useEffect } from 'react';
import { signalRService } from '../services/signalr';
import { useTimerStore } from '../store/timerStore';

/**
 * Custom hook to manage SignalR connection and timer updates
 *
 * OPTIMIZED APPROACH:
 * - Client calculates elapsed time locally every 1 second
 * - Server syncs every 30 seconds to maintain accuracy
 * - Reduces server load by 30x compared to 1s broadcasts
 */
export const useSignalR = (userId: string | null) => {
  const { updateLocalElapsedTime, syncTimersFromServer } = useTimerStore();

  useEffect(() => {
    if (!userId) return;

    let clientTimerInterval: NodeJS.Timeout | null = null;

    // Connect to SignalR
    const connect = async () => {
      try {
        await signalRService.connect(userId);

        // Subscribe to timer sync events (every 30s from server)
        signalRService.onTimerSync((updates) => {
          console.log(`[SignalR] Received timer sync: ${updates.length} timers`);
          syncTimersFromServer(updates);
        });

        // Start client-side timer (update UI every 1 second)
        clientTimerInterval = setInterval(() => {
          updateLocalElapsedTime();
        }, 1000);

        console.log('SignalR connected and client-side timer started');
      } catch (error) {
        console.error('Failed to connect to SignalR:', error);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (clientTimerInterval) {
        clearInterval(clientTimerInterval);
      }
      signalRService.disconnect();
    };
  }, [userId, updateLocalElapsedTime, syncTimersFromServer]);

  return {
    connectionState: signalRService.getState(),
  };
};
