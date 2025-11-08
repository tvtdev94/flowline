using Flowline.Domain.Enums;

namespace Flowline.Domain.Entities;

// Named TaskEntity to avoid conflict with System.Threading.Tasks.Task
public sealed record TaskEntity
{
    public required Guid Id { get; init; }
    public required Guid UserId { get; init; }
    public Guid? ProjectId { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public required string Color { get; init; }
    public required Enums.TaskStatus Status { get; init; }
    public required DateTime CreatedAt { get; init; }
}
