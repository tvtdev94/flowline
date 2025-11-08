namespace Flowline.Application.TimeEntries.Stop;

public sealed record StopTimerResponse
{
    public required Guid Id { get; init; }
    public required DateTime EndTime { get; init; }
    public required TimeSpan Duration { get; init; }
}
