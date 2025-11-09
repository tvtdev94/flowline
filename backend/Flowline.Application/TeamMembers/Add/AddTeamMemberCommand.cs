using MediatR;

namespace Flowline.Application.TeamMembers.Add;

public sealed record AddTeamMemberCommand : IRequest<AddTeamMemberResponse>
{
    public required Guid TeamId { get; init; }
    public required Guid UserIdToAdd { get; init; }
    public required Guid RequesterId { get; init; } // User making the request
    public string Role { get; init; } = "Member"; // Default to Member
}
