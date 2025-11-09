namespace Flowline.Application.Projects.GetAll;

public sealed record GetProjectsResponse
{
    public required Guid Id { get; init; }
    public required Guid UserId { get; init; }
    public required string Name { get; init; }
    public required string Color { get; init; }
    public required bool IsArchived { get; init; }
    public required DateTime CreatedAt { get; init; }
}
