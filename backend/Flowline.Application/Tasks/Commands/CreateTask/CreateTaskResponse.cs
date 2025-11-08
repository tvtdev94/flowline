namespace Flowline.Application.Tasks.Commands.CreateTask;

public sealed record CreateTaskResponse
{
    public required Guid Id { get; init; }
    public required DateTime CreatedAt { get; init; }
}
