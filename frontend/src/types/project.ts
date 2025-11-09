export interface Project {
  id: string;
  userId: string;
  name: string;
  color: string;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateProjectRequest {
  userId: string;
  name: string;
  color: string;
}

export interface UpdateProjectRequest {
  userId: string;
  name?: string;
  color?: string;
  isArchived?: boolean;
}
