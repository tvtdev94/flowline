namespace Flowline.Application.TimeEntries.GetAll;

public sealed record GetTimeEntriesResponse
{
    public required Guid Id { get; init; }
    public required Guid TaskId { get; init; }
    public required DateTime StartTime { get; init; }
    public DateTime? EndTime { get; init; }
    public string? Notes { get; init; }
    public required DateTime CreatedAt { get; init; }

    // Task details
    public TaskInfo? Task { get; init; }
}

public sealed record TaskInfo
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public required string Color { get; init; }
    public required string Status { get; init; }
}
