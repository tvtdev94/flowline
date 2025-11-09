namespace Flowline.Application.Stats;

public sealed record DailyStatsResponse
{
    public required DateTime Date { get; init; }
    public required double TotalMinutes { get; init; }
    public required double TotalHours { get; init; }
    public required List<ProjectTimeDto> ByProject { get; init; }
    public required List<TaskTimeDto> ByTask { get; init; }
}

public sealed record ProjectTimeDto
{
    public Guid? ProjectId { get; init; }
    public required string ProjectName { get; init; }
    public string? Color { get; init; }
    public required double TotalMinutes { get; init; }
    public required double Percentage { get; init; }
}

public sealed record TaskTimeDto
{
    public required Guid TaskId { get; init; }
    public required string TaskTitle { get; init; }
    public required string TaskColor { get; init; }
    public required double TotalMinutes { get; init; }
    public required int SessionCount { get; init; }
}
