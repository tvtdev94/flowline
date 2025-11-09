using MediatR;

namespace Flowline.Application.Teams.GetAll;

public sealed record GetTeamsQuery : IRequest<List<TeamResponse>>
{
    public required Guid UserId { get; init; }
}
