import * as signalR from '@microsoft/signalr';
import { TimerTickEvent } from '../types/timeEntry';

const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || 'http://localhost:5000/hubs/timer';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private userId: string | null = null;

  /**
   * Initialize SignalR connection
   */
  async connect(userId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('SignalR already connected');
      return;
    }

    this.userId = userId;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${SIGNALR_HUB_URL}?userId=${userId}`, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.userId = null;
      console.log('SignalR disconnected');
    }
  }

  /**
   * Subscribe to timer tick events
   */
  onTimerTick(callback: (event: TimerTickEvent) => void): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('OnTimerTick', callback);
  }

  /**
   * Subscribe to timer started events
   */
  onTimerStarted(callback: (timeEntry: any) => void): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('OnTimerStarted', callback);
  }

  /**
   * Subscribe to timer stopped events
   */
  onTimerStopped(callback: (timeEntry: any) => void): void {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    this.connection.on('OnTimerStopped', callback);
  }

  /**
   * Manually join a timer group
   */
  async joinTimerGroup(userId: string): Promise<void> {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    try {
      await this.connection.invoke('JoinTimerGroup', userId);
      console.log(`Joined timer group: ${userId}`);
    } catch (error) {
      console.error('Failed to join timer group:', error);
    }
  }

  /**
   * Manually leave a timer group
   */
  async leaveTimerGroup(userId: string): Promise<void> {
    if (!this.connection) {
      console.error('SignalR not connected');
      return;
    }

    try {
      await this.connection.invoke('LeaveTimerGroup', userId);
      console.log(`Left timer group: ${userId}`);
    } catch (error) {
      console.error('Failed to leave timer group:', error);
    }
  }

  /**
   * Get connection state
   */
  getState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }
}

export const signalRService = new SignalRService();
