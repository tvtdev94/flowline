using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Entities;
using Flowline.Domain.Enums;
using MediatR;

namespace Flowline.Application.Teams.Create;

public sealed class CreateTeamHandler : IRequestHandler<CreateTeamCommand, CreateTeamResponse>
{
    private readonly IApplicationDbContext _context;

    public CreateTeamHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateTeamResponse> Handle(
        CreateTeamCommand request,
        CancellationToken cancellationToken)
    {
        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            OwnerId = request.OwnerId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Teams.Add(team);

        // Auto-add owner as team member with Owner role
        var ownerMember = new TeamMember
        {
            Id = Guid.NewGuid(),
            TeamId = team.Id,
            UserId = request.OwnerId,
            Role = TeamRole.Owner,
            JoinedAt = DateTime.UtcNow
        };

        _context.TeamMembers.Add(ownerMember);

        await _context.SaveChangesAsync(cancellationToken);

        return new CreateTeamResponse
        {
            Id = team.Id,
            Name = team.Name,
            OwnerId = team.OwnerId,
            CreatedAt = team.CreatedAt
        };
    }
}
