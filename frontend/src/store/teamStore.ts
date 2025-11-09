import { create } from 'zustand';
import { teamApi } from '../services/api';

interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  memberCount?: number;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
}

interface TeamStore {
  teams: Team[];
  currentTeam: Team | null;
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;

  fetchTeams: (userId: string) => Promise<void>;
  fetchTeamMembers: (teamId: string, userId: string) => Promise<void>;
  createTeam: (userId: string, name: string) => Promise<void>;
  updateTeam: (teamId: string, userId: string, name: string) => Promise<void>;
  deleteTeam: (teamId: string, userId: string) => Promise<void>;
  addMember: (teamId: string, requesterId: string, userEmail: string, role: string) => Promise<void>;
  removeMember: (teamId: string, userId: string, requesterId: string) => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;
  clearError: () => void;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  currentTeam: null,
  teamMembers: [],
  isLoading: false,
  error: null,

  fetchTeams: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const teams = await teamApi.getAll(userId);
      set({ teams, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch teams', isLoading: false });
      console.error('Error fetching teams:', error);
    }
  },

  fetchTeamMembers: async (teamId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const members = await teamApi.getMembers(teamId, userId);
      set({ teamMembers: members, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch team members', isLoading: false });
      console.error('Error fetching team members:', error);
    }
  },

  createTeam: async (userId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      await teamApi.create(userId, name);
      await get().fetchTeams(userId);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to create team', isLoading: false });
      console.error('Error creating team:', error);
      throw error;
    }
  },

  updateTeam: async (teamId: string, userId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      await teamApi.update(teamId, userId, name);
      await get().fetchTeams(userId);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update team', isLoading: false });
      console.error('Error updating team:', error);
      throw error;
    }
  },

  deleteTeam: async (teamId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await teamApi.delete(teamId, userId);
      await get().fetchTeams(userId);
      set({ currentTeam: null, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete team', isLoading: false });
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  addMember: async (teamId: string, requesterId: string, userEmail: string, role: string) => {
    set({ isLoading: true, error: null });
    try {
      await teamApi.addMember(teamId, requesterId, userEmail, role);
      await get().fetchTeamMembers(teamId, requesterId);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add team member', isLoading: false });
      console.error('Error adding team member:', error);
      throw error;
    }
  },

  removeMember: async (teamId: string, userId: string, requesterId: string) => {
    set({ isLoading: true, error: null });
    try {
      await teamApi.removeMember(teamId, userId, requesterId);
      await get().fetchTeamMembers(teamId, requesterId);
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to remove team member', isLoading: false });
      console.error('Error removing team member:', error);
      throw error;
    }
  },

  setCurrentTeam: (team: Team | null) => set({ currentTeam: team }),

  clearError: () => set({ error: null }),
}));
