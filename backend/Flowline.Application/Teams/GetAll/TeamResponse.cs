namespace Flowline.Application.Teams.GetAll;

public sealed record TeamResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required Guid OwnerId { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required string Role { get; init; } // User's role in this team
    public required int MemberCount { get; init; }
}
