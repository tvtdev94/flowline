using MediatR;

namespace Flowline.Application.Teams.Create;

public sealed record CreateTeamCommand : IRequest<CreateTeamResponse>
{
    public required string Name { get; init; }
    public required Guid OwnerId { get; init; }
}
