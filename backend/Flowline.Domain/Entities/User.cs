namespace Flowline.Domain.Entities;

public sealed record User
{
    public required Guid Id { get; init; }
    public required string GoogleId { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
    public string? Picture { get; init; }
    public required DateTime CreatedAt { get; init; }
    public DateTime? LastLoginAt { get; init; }
}
