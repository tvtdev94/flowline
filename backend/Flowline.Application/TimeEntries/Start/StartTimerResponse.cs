namespace Flowline.Application.TimeEntries.Start;

public sealed record StartTimerResponse
{
    public required Guid Id { get; init; }
    public required Guid TaskId { get; init; }
    public required DateTime StartTime { get; init; }
}
