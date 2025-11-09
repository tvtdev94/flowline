using MediatR;

namespace Flowline.Application.Teams.Update;

public sealed record UpdateTeamCommand : IRequest<UpdateTeamResponse>
{
    public required Guid TeamId { get; init; }
    public required Guid UserId { get; init; } // For authorization
    public required string Name { get; init; }
}
