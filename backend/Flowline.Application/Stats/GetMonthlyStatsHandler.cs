using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Flowline.Application.Stats;

public sealed class GetMonthlyStatsHandler : IRequestHandler<GetMonthlyStatsQuery, MonthlyStatsResponse>
{
    private readonly IApplicationDbContext _context;

    public GetMonthlyStatsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MonthlyStatsResponse> Handle(
        GetMonthlyStatsQuery request,
        CancellationToken cancellationToken)
    {
        var startDate = new DateTime(request.Year, request.Month, 1);
        var endDate = startDate.AddMonths(1);

        // Get all time entries for the month
        var entries = await _context.TimeEntries
            .Include(e => e.Task)
            .ThenInclude(t => t.Project)
            .Where(e => e.Task.UserId == request.UserId
                     && e.StartTime.Date >= startDate
                     && e.StartTime.Date < endDate
                     && e.EndTime != null) // Only completed entries
            .ToListAsync(cancellationToken);

        if (!entries.Any())
        {
            return new MonthlyStatsResponse
            {
                Year = request.Year,
                Month = request.Month,
                StartDate = startDate,
                EndDate = endDate.AddDays(-1),
                TotalMinutes = 0,
                TotalHours = 0,
                ByProject = new List<ProjectTimeDto>(),
                ByTask = new List<TaskTimeDto>(),
                DailyBreakdown = new List<DailyBreakdown>(),
                WeeklyBreakdown = new List<WeeklyBreakdown>()
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

        // Daily breakdown
        var dailyBreakdown = entries
            .GroupBy(e => e.StartTime.Date)
            .Select(g => new DailyBreakdown
            {
                Date = g.Key,
                TotalMinutes = g.Sum(e => (e.EndTime!.Value - e.StartTime).TotalMinutes),
                TotalHours = g.Sum(e => (e.EndTime!.Value - e.StartTime).TotalMinutes) / 60
            })
            .OrderBy(d => d.Date)
            .ToList();

        // Weekly breakdown (ISO 8601 week)
        var calendar = CultureInfo.CurrentCulture.Calendar;
        var weeklyBreakdown = entries
            .GroupBy(e =>
            {
                var weekNumber = calendar.GetWeekOfYear(
                    e.StartTime.Date,
                    CalendarWeekRule.FirstFourDayWeek,
                    DayOfWeek.Monday
                );
                return new { e.StartTime.Date.Year, WeekNumber = weekNumber };
            })
            .Select(g =>
            {
                var firstDateOfWeek = g.Min(e => e.StartTime.Date);
                var lastDateOfWeek = g.Max(e => e.StartTime.Date);

                return new WeeklyBreakdown
                {
                    WeekNumber = g.Key.WeekNumber,
                    StartDate = firstDateOfWeek,
                    EndDate = lastDateOfWeek,
                    TotalMinutes = g.Sum(e => (e.EndTime!.Value - e.StartTime).TotalMinutes),
                    TotalHours = g.Sum(e => (e.EndTime!.Value - e.StartTime).TotalMinutes) / 60
                };
            })
            .OrderBy(w => w.StartDate)
            .ToList();

        return new MonthlyStatsResponse
        {
            Year = request.Year,
            Month = request.Month,
            StartDate = startDate,
            EndDate = endDate.AddDays(-1),
            TotalMinutes = totalMinutes,
            TotalHours = totalMinutes / 60,
            ByProject = byProject,
            ByTask = byTask,
            DailyBreakdown = dailyBreakdown,
            WeeklyBreakdown = weeklyBreakdown
        };
    }
}
