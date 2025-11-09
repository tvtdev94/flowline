namespace Flowline.Application.Projects.Update;

public sealed record UpdateProjectResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Color { get; init; }
    public required bool IsArchived { get; init; }
}
