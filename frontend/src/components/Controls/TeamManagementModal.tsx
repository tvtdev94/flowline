import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTeamStore } from '../../store/teamStore';

interface TeamManagementModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ userId, isOpen, onClose }) => {
  const {
    teams,
    currentTeam,
    teamMembers,
    fetchTeams,
    fetchTeamMembers,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    setCurrentTeam,
    isLoading,
  } = useTeamStore();

  const [view, setView] = useState<'list' | 'members'>('list');
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTeams(userId);
    }
  }, [isOpen, userId, fetchTeams]);

  useEffect(() => {
    if (currentTeam) {
      fetchTeamMembers(currentTeam.id, userId);
      setView('members');
    }
  }, [currentTeam, userId, fetchTeamMembers]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      await createTeam(userId, newTeamName.trim());
      setNewTeamName('');
      setIsCreating(false);
      toast.success('Team created successfully');
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const handleEditTeam = (team: any) => {
    setEditingTeam(team);
    setEditName(team.name);
  };

  const handleSaveEdit = async () => {
    if (!editingTeam || !editName.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      await updateTeam(editingTeam.id, userId, editName.trim());
      setEditingTeam(null);
      toast.success('Team updated successfully');
    } catch (error) {
      toast.error('Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"? All team data will be removed.`)) {
      return;
    }

    try {
      await deleteTeam(teamId, userId);
      toast.success('Team deleted successfully');
    } catch (error) {
      toast.error('Failed to delete team');
    }
  };

  const handleViewMembers = (team: any) => {
    setCurrentTeam(team);
  };

  const handleBackToList = () => {
    setCurrentTeam(null);
    setView('list');
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !newMemberEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      await addMember(currentTeam.id, userId, newMemberEmail.trim(), 'Member');
      setNewMemberEmail('');
      toast.success('Member added successfully');
    } catch (error) {
      toast.error('Failed to add member. User may not exist.');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!currentTeam) return;

    if (!confirm(`Remove ${memberName} from the team?`)) {
      return;
    }

    try {
      await removeMember(currentTeam.id, memberId, userId);
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            {view === 'members' && currentTeam && (
              <button
                onClick={handleBackToList}
                className="text-gray-600 hover:text-gray-900"
                title="Back to teams"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-semibold">
              {view === 'list' ? 'Manage Teams' : `Team: ${currentTeam?.name}`}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {view === 'list' ? (
            <>
              {/* Create New Team Button */}
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full mb-4 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Team
                </button>
              )}

              {/* Create Team Form */}
              {isCreating && (
                <form onSubmit={handleCreateTeam} className="mb-4 p-4 border border-blue-300 rounded-lg bg-blue-50">
                  <h3 className="font-medium text-gray-900 mb-3">New Team</h3>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Team name (e.g., Marketing Team)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewTeamName('');
                      }}
                      className="px-4 py-2 text-gray-700 bg-white rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {/* Teams List */}
              <div className="space-y-2">
                {isLoading && teams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Loading teams...</div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No teams yet. Create one to collaborate with your team!
                  </div>
                ) : (
                  teams.map((team) => (
                    <div key={team.id} className="p-4 border rounded-lg bg-white border-gray-300">
                      {editingTeam?.id === team.id ? (
                        <div>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingTeam(null)}
                              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{team.name}</span>
                              {team.ownerId === userId && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  Owner
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Created {new Date(team.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewMembers(team)}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              Members
                            </button>
                            {team.ownerId === userId && (
                              <>
                                <button
                                  onClick={() => handleEditTeam(team)}
                                  className="p-1 text-gray-600 hover:text-blue-600"
                                  title="Edit"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(team.id, team.name)}
                                  className="p-1 text-gray-600 hover:text-red-600"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Team Members View */}
              {currentTeam?.ownerId === userId && (
                <form onSubmit={handleAddMember} className="mb-4 p-4 border border-green-300 rounded-lg bg-green-50">
                  <h3 className="font-medium text-gray-900 mb-3">Add Team Member</h3>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="member@example.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      disabled={isLoading}
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Enter the email of an existing Flowline user
                  </p>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 mb-3">Team Members ({teamMembers.length})</h3>
                {isLoading && teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Loading members...</div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No members yet</div>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member.id} className="p-4 border rounded-lg bg-white flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{member.userName}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            member.role === 'Owner'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{member.userEmail}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {currentTeam?.ownerId === userId && member.role !== 'Owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.userId, member.userName)}
                          className="p-2 text-gray-600 hover:text-red-600"
                          title="Remove member"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t px-6 py-4">
          <button
            onClick={view === 'members' ? handleBackToList : onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            {view === 'members' ? 'Back to Teams' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;
