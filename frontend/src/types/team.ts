export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  memberCount?: number;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: TeamRole;
  joinedAt: string;
}

export enum TeamRole {
  Owner = 'Owner',
  Member = 'Member',
}

export interface CreateTeamRequest {
  userId: string;
  name: string;
}

export interface UpdateTeamRequest {
  userId: string;
  name?: string;
}

export interface AddTeamMemberRequest {
  requesterId: string;
  userEmail: string;
  role: TeamRole;
}
