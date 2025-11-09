import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { statsApi } from '../../services/statsApi';
import { DailyStats } from '../../types/stats';

interface StatsPanelProps {
  userId: string;
  date: Date;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ userId, date }) => {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await statsApi.getDailyStats(userId, date);
        setStats(data);
      } catch (err) {
        setError((err as Error).message);
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId, date]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error loading stats: {error}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalMinutes === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
        <p className="text-gray-600 text-center py-8">
          No data for this date. Start tracking time to see statistics.
        </p>
      </div>
    );
  }

  // Format hours and minutes
  const hours = Math.floor(stats.totalHours);
  const minutes = Math.round((stats.totalHours - hours) * 60);

  // Prepare data for pie chart (by project)
  const projectChartData = stats.byProject.map((p) => ({
    name: p.projectName,
    value: parseFloat(p.totalMinutes.toFixed(2)),
    percentage: p.percentage,
    color: p.color || '#3b82f6',
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-6">Daily Statistics</h3>

      {/* Total Time Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
        <div className="text-sm opacity-90 mb-1">Total Time Tracked</div>
        <div className="text-4xl font-bold">
          {hours}h {minutes}m
        </div>
        <div className="text-sm opacity-75 mt-1">
          {stats.totalMinutes.toFixed(0)} minutes across {stats.byTask.length} tasks
        </div>
      </div>

      {/* Pie Chart - Time by Project */}
      {stats.byProject.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-4">Time by Project</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {projectChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${(value / 60).toFixed(2)}h`}
              />
              <Legend
                formatter={(value, entry: any) => {
                  const minutes = entry.payload.value;
                  const hours = (minutes / 60).toFixed(2);
                  return `${value} (${hours}h)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tasks Breakdown */}
      <div>
        <h4 className="text-md font-semibold mb-4">Tasks Breakdown</h4>
        <div className="space-y-3">
          {stats.byTask.map((task) => {
            const taskHours = (task.totalMinutes / 60).toFixed(2);
            const taskPercentage = (task.totalMinutes / stats.totalMinutes) * 100;

            return (
              <div
                key={task.taskId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: task.taskColor }}
                    ></div>
                    <span className="font-medium">{task.taskTitle}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{taskHours}h</div>
                    <div className="text-xs text-gray-500">{task.sessionCount} sessions</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${taskPercentage}%`,
                      backgroundColor: task.taskColor,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
