namespace Flowline.Application.TeamMembers.GetAll;

public sealed record TeamMemberResponse
{
    public required Guid Id { get; init; }
    public required Guid UserId { get; init; }
    public required string UserName { get; init; }
    public required string UserEmail { get; init; }
    public string? UserPicture { get; init; }
    public required string Role { get; init; }
    public required DateTime JoinedAt { get; init; }
}
