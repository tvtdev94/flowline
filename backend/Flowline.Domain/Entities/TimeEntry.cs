namespace Flowline.Domain.Entities;

public sealed class TimeEntry
{
    public required Guid Id { get; init; }
    public required Guid TaskId { get; init; }
    public required DateTime StartTime { get; init; }
    public DateTime? EndTime { get; init; } // null = still running
    public string? Notes { get; init; }
    public required DateTime CreatedAt { get; init; }

    // Navigation property
    public TaskEntity Task { get; set; } = null!;

    // Computed property
    public TimeSpan? Duration => EndTime.HasValue
        ? EndTime.Value - StartTime
        : DateTime.UtcNow - StartTime;
}
