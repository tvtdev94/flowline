export enum TaskStatus {
  Active = 'Active',
  Paused = 'Paused',
  Stuck = 'Stuck',
  Done = 'Done'
}

export interface Task {
  id: string;
  userId: string;
  teamId?: string;
  projectId?: string;
  title: string;
  description?: string;
  color: string;
  status: TaskStatus;
  isPrivate: boolean;
  createdAt: string;
}

export interface CreateTaskRequest {
  userId: string;
  teamId?: string;
  projectId?: string;
  title: string;
  description?: string;
  color: string;
  status: TaskStatus;
  isPrivate: boolean;
}
