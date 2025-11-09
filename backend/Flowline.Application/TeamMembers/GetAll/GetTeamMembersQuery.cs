using MediatR;

namespace Flowline.Application.TeamMembers.GetAll;

public sealed record GetTeamMembersQuery : IRequest<List<TeamMemberResponse>>
{
    public required Guid TeamId { get; init; }
    public required Guid RequesterId { get; init; } // For authorization
}
