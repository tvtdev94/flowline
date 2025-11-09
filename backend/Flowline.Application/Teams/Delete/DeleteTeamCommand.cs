using MediatR;

namespace Flowline.Application.Teams.Delete;

public sealed record DeleteTeamCommand : IRequest
{
    public required Guid TeamId { get; init; }
    public required Guid UserId { get; init; } // For authorization
}
