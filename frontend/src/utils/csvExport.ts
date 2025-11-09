import toast from 'react-hot-toast';
import { TimeEntry } from '../types/timeEntry';

export function exportTimeEntriesToCSV(timeEntries: TimeEntry[], date: Date): void {
  if (timeEntries.length === 0) {
    toast.error('No time entries to export');
    return;
  }

  // CSV headers
  const headers = ['Task Title', 'Description', 'Start Time', 'End Time', 'Duration (minutes)', 'Status', 'Color'];

  // CSV rows
  const rows = timeEntries.map(entry => {
    const startTime = new Date(entry.startTime);
    const endTime = entry.endTime ? new Date(entry.endTime) : null;
    const duration = endTime
      ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)
      : 'In Progress';

    return [
      `"${entry.task.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${(entry.task.description || '').replace(/"/g, '""')}"`,
      startTime.toLocaleString(),
      endTime ? endTime.toLocaleString() : 'In Progress',
      duration,
      entry.task.status,
      entry.task.color
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  link.setAttribute('href', url);
  link.setAttribute('download', `flowline-timeentries-${dateStr}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Exported ${timeEntries.length} time entries to CSV`);
}
