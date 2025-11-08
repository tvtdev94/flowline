using TaskStatus = Flowline.Domain.Enums.TaskStatus;

namespace Flowline.Application.Tasks.GetAll;

public sealed record GetTasksResponse
{
    public required List<TaskDto> Tasks { get; init; }
}

public sealed record TaskDto
{
    public required Guid Id { get; init; }
    public required Guid UserId { get; init; }
    public Guid? ProjectId { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public required string Color { get; init; }
    public required TaskStatus Status { get; init; }
    public required DateTime CreatedAt { get; init; }
}
