namespace Flowline.Application.Stats;

public sealed record MonthlyStatsResponse
{
    public required int Year { get; init; }
    public required int Month { get; init; }
    public required DateTime StartDate { get; init; }
    public required DateTime EndDate { get; init; }
    public required double TotalMinutes { get; init; }
    public required double TotalHours { get; init; }
    public required List<ProjectTimeDto> ByProject { get; init; }
    public required List<TaskTimeDto> ByTask { get; init; }
    public required List<DailyBreakdown> DailyBreakdown { get; init; }
    public required List<WeeklyBreakdown> WeeklyBreakdown { get; init; }
}

public sealed record WeeklyBreakdown
{
    public required int WeekNumber { get; init; }
    public required DateTime StartDate { get; init; }
    public required DateTime EndDate { get; init; }
    public required double TotalMinutes { get; init; }
    public required double TotalHours { get; init; }
}
