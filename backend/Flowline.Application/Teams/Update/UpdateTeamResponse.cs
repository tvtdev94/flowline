namespace Flowline.Application.Teams.Update;

public sealed record UpdateTeamResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
}
