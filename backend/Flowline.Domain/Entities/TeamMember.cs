namespace Flowline.Domain.Entities;

public sealed record TeamMember
{
    public required Guid Id { get; init; }
    public required Guid TeamId { get; init; }
    public required Guid UserId { get; init; }
    public required Enums.TeamRole Role { get; init; }
    public required DateTime JoinedAt { get; init; }
}
