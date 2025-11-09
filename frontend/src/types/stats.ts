export interface DailyStats {
  date: string;
  totalMinutes: number;
  totalHours: number;
  byProject: ProjectTime[];
  byTask: TaskTime[];
}

export interface ProjectTime {
  projectId?: string;
  projectName: string;
  color?: string;
  totalMinutes: number;
  percentage: number;
}

export interface TaskTime {
  taskId: string;
  taskTitle: string;
  taskColor: string;
  totalMinutes: number;
  sessionCount: number;
}
