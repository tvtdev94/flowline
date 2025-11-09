import { useEffect } from 'react';
import { signalRService } from '../services/signalr';
import { useTimerStore } from '../store/timerStore';

/**
 * Custom hook to manage SignalR connection and timer updates
 */
export const useSignalR = (userId: string | null) => {
  const { updateTimerTick } = useTimerStore();

  useEffect(() => {
    if (!userId) return;

    // Connect to SignalR
    const connect = async () => {
      try {
        await signalRService.connect(userId);

        // Subscribe to timer tick events
        signalRService.onTimerTick((event) => {
          updateTimerTick(event.id, event.duration);
        });

        console.log('SignalR connected and listening for timer updates');
      } catch (error) {
        console.error('Failed to connect to SignalR:', error);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      signalRService.disconnect();
    };
  }, [userId, updateTimerTick]);

  return {
    connectionState: signalRService.getState(),
  };
};
