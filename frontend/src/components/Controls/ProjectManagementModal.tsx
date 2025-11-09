import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useProjectStore } from '../../store/projectStore';
import { Project } from '../../types/project';

interface ProjectManagementModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PROJECT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const ProjectManagementModal: React.FC<ProjectManagementModalProps> = ({ userId, isOpen, onClose }) => {
  const { projects, fetchProjects, createProject, updateProject, deleteProject, isLoading } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProjects(userId);
    }
  }, [isOpen, userId, fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      await createProject(userId, newProjectName.trim(), newProjectColor);
      setNewProjectName('');
      setNewProjectColor(PROJECT_COLORS[0]);
      setIsCreating(false);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditColor(project.color);
  };

  const handleSaveEdit = async () => {
    if (!editingProject || !editName.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      await updateProject(editingProject.id, userId, {
        name: editName.trim(),
        color: editColor,
      });
      setEditingProject(null);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This will remove the project from all associated tasks.`)) {
      return;
    }

    try {
      await deleteProject(projectId, userId);
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project. It may be in use by tasks.');
    }
  };

  const handleArchiveToggle = async (project: Project) => {
    try {
      await updateProject(project.id, userId, {
        isArchived: !project.isArchived,
      });
      toast.success(project.isArchived ? 'Project unarchived' : 'Project archived');
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Manage Projects</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Create New Project Button */}
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full mb-4 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Project
            </button>
          )}

          {/* Create Project Form */}
          {isCreating && (
            <form onSubmit={handleCreateProject} className="mb-4 p-4 border border-blue-300 rounded-lg bg-blue-50">
              <h3 className="font-medium text-gray-900 mb-3">New Project</h3>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Client Work, Personal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewProjectColor(c)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newProjectColor === c ? 'border-gray-900 scale-110' : 'border-gray-300'
                      } transition-transform`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewProjectName('');
                    setNewProjectColor(PROJECT_COLORS[0]);
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

          {/* Projects List */}
          <div className="space-y-2">
            {isLoading && projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No projects yet. Create one to get started!
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 border rounded-lg ${
                    project.isArchived ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                  }`}
                >
                  {editingProject?.id === project.id ? (
                    // Edit Mode
                    <div>
                      <div className="mb-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mb-3">
                        <div className="flex gap-2">
                          {PROJECT_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              className={`w-8 h-8 rounded-full border-2 ${
                                editColor === c ? 'border-gray-900 scale-110' : 'border-gray-300'
                              } transition-transform`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingProject(null)}
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
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className={`font-medium ${project.isArchived ? 'text-gray-500' : 'text-gray-900'}`}>
                          {project.name}
                        </span>
                        {project.isArchived && (
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleArchiveToggle(project)}
                          className="p-1 text-gray-600 hover:text-yellow-600"
                          title={project.isArchived ? 'Unarchive' : 'Archive'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagementModal;
