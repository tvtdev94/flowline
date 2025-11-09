namespace Flowline.Application.Stats;

public sealed record WeeklyStatsResponse
{
    public required DateTime StartDate { get; init; }
    public required DateTime EndDate { get; init; }
    public required double TotalMinutes { get; init; }
    public required double TotalHours { get; init; }
    public required List<ProjectTimeDto> ByProject { get; init; }
    public required List<TaskTimeDto> ByTask { get; init; }
    public required List<DailyBreakdown> DailyBreakdown { get; init; }
}

public sealed record DailyBreakdown
{
    public required DateTime Date { get; init; }
    public required double TotalMinutes { get; init; }
    public required double TotalHours { get; init; }
}
