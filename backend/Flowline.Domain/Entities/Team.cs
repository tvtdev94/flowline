namespace Flowline.Domain.Entities;

public sealed record Team
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required Guid OwnerId { get; init; }
    public required DateTime CreatedAt { get; init; }
}
