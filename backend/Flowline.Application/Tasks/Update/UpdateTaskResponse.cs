namespace Flowline.Application.Tasks.Update;

public sealed record UpdateTaskResponse
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public required string Color { get; init; }
    public required string Status { get; init; }
    public required DateTime UpdatedAt { get; init; }
}
