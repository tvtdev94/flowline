using Flowline.Domain.Enums;

namespace Flowline.Domain.Entities;

// Named TaskEntity to avoid conflict with System.Threading.Tasks.Task
public sealed class TaskEntity
{
    public required Guid Id { get; init; }
    public required Guid UserId { get; init; }
    public Guid? TeamId { get; init; } // null = personal task, set = team task
    public Guid? ProjectId { get; init; }
    public required string Title { get; set; } // Mutable for updates
    public string? Description { get; set; } // Mutable for updates
    public required string Color { get; set; } // Mutable for updates
    public required Enums.TaskStatus Status { get; set; } // Mutable for updates
    public required bool IsPrivate { get; init; } // If true, hide from team
    public required DateTime CreatedAt { get; init; }

    // Navigation properties
    public Project? Project { get; set; }
}
