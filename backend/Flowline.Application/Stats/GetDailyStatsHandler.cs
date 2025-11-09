using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Stats;

public sealed class GetDailyStatsHandler : IRequestHandler<GetDailyStatsQuery, DailyStatsResponse>
{
    private readonly IApplicationDbContext _context;

    public GetDailyStatsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DailyStatsResponse> Handle(
        GetDailyStatsQuery request,
        CancellationToken cancellationToken)
    {
        var date = request.Date.Date;

        // Get all time entries for the date
        var entries = await _context.TimeEntries
            .Include(e => e.Task)
            .ThenInclude(t => t.Project)
            .Where(e => e.Task.UserId == request.UserId
                     && e.StartTime.Date == date
                     && e.EndTime != null) // Only completed entries
            .ToListAsync(cancellationToken);

        if (!entries.Any())
        {
            return new DailyStatsResponse
            {
                Date = date,
                TotalMinutes = 0,
                TotalHours = 0,
                ByProject = new List<ProjectTimeDto>(),
                ByTask = new List<TaskTimeDto>()
            };
        }

        // Calculate total time
        var totalMinutes = entries.Sum(e =>
        {
            var duration = e.EndTime!.Value - e.StartTime;
            return duration.TotalMinutes;
        });

        // Group by project
        var byProject = entries
            .GroupBy(e => new
            {
                ProjectId = e.Task.ProjectId,
                ProjectName = e.Task.Project?.Name ?? "No Project",
                Color = e.Task.Project?.Color
            })
            .Select(g => new ProjectTimeDto
            {
                ProjectId = g.Key.ProjectId,
                ProjectName = g.Key.ProjectName,
                Color = g.Key.Color,
                TotalMinutes = g.Sum(e => (e.EndTime!.Value - e.StartTime).TotalMinutes),
                Percentage = (g.Sum(e => (e.EndTime!.Value - e.StartTime).TotalMinutes) / totalMinutes) * 100
            })
            .OrderByDescending(p => p.TotalMinutes)
            .ToList();

        // Group by task
        var byTask = entries
            .GroupBy(e => new
            {
                TaskId = e.Task.Id,
                TaskTitle = e.Task.Title,
                TaskColor = e.Task.Color
            })
            .Select(g => new TaskTimeDto
            {
                TaskId = g.Key.TaskId,
                TaskTitle = g.Key.TaskTitle,
                TaskColor = g.Key.TaskColor,
                TotalMinutes = g.Sum(e => (e.EndTime!.Value - e.StartTime).TotalMinutes),
                SessionCount = g.Count()
            })
            .OrderByDescending(t => t.TotalMinutes)
            .ToList();

        return new DailyStatsResponse
        {
            Date = date,
            TotalMinutes = totalMinutes,
            TotalHours = totalMinutes / 60,
            ByProject = byProject,
            ByTask = byTask
        };
    }
}
