namespace Flowline.Application.TimeEntries.Update;

public sealed record UpdateTimeEntryResponse
{
    public required Guid Id { get; init; }
    public required DateTime StartTime { get; init; }
    public DateTime? EndTime { get; init; }
    public TimeSpan? Duration { get; init; }
}
