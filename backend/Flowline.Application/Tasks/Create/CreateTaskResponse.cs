namespace Flowline.Application.Tasks.Create;

public sealed record CreateTaskResponse
{
    public required Guid Id { get; init; }
    public required DateTime CreatedAt { get; init; }
}
