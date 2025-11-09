using MediatR;

namespace Flowline.Application.TeamMembers.Remove;

public sealed record RemoveTeamMemberCommand : IRequest
{
    public required Guid TeamId { get; init; }
    public required Guid UserIdToRemove { get; init; }
    public required Guid RequesterId { get; init; } // User making the request
}
