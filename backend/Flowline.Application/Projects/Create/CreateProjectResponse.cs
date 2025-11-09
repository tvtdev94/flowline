namespace Flowline.Application.Projects.Create;

public sealed record CreateProjectResponse
{
    public required Guid Id { get; init; }
    public required DateTime CreatedAt { get; init; }
}
