using Flowline.Application.Teams.GetAll;
using MediatR;

namespace Flowline.Application.Teams.GetById;

public sealed record GetTeamByIdQuery : IRequest<TeamResponse>
{
    public required Guid TeamId { get; init; }
    public required Guid UserId { get; init; } // For authorization check
}
