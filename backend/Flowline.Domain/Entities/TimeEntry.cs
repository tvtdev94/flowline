namespace Flowline.Domain.Entities;

public sealed class TimeEntry
{
    public required Guid Id { get; init; }
    public required Guid TaskId { get; init; }
    public required DateTime StartTime { get; set; } // MUTABLE for drag-to-adjust
    public DateTime? EndTime { get; set; } // null = still running - MUTABLE for EF Core updates
    public string? Notes { get; set; } // MUTABLE
    public required DateTime CreatedAt { get; init; }

    // Navigation property
    public TaskEntity Task { get; set; } = null!;

    // Computed property
    public TimeSpan? Duration => EndTime.HasValue
        ? EndTime.Value - StartTime
        : DateTime.UtcNow - StartTime;
}
