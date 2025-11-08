namespace Flowline.Domain.Entities;

public sealed record Project
{
    public required Guid Id { get; init; }
    public required Guid UserId { get; init; }
    public required string Name { get; init; }
    public required string Color { get; init; }
    public required bool IsArchived { get; init; }
    public required DateTime CreatedAt { get; init; }
}
