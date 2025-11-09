namespace Flowline.Application.TeamMembers.Add;

public sealed record AddTeamMemberResponse
{
    public required Guid Id { get; init; }
    public required Guid TeamId { get; init; }
    public required Guid UserId { get; init; }
    public required string Role { get; init; }
    public required DateTime JoinedAt { get; init; }
}
