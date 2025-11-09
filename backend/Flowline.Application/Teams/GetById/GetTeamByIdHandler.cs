using Flowline.Application.Common.Interfaces;
using Flowline.Application.Teams.GetAll;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Teams.GetById;

public sealed class GetTeamByIdHandler : IRequestHandler<GetTeamByIdQuery, TeamResponse>
{
    private readonly IApplicationDbContext _context;

    public GetTeamByIdHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TeamResponse> Handle(
        GetTeamByIdQuery request,
        CancellationToken cancellationToken)
    {
        // Check if user is member of this team
        var membership = await _context.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.UserId, cancellationToken);

        if (membership == null)
        {
            throw new UnauthorizedAccessException("User is not a member of this team");
        }

        var team = await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
        {
            throw new InvalidOperationException($"Team {request.TeamId} not found");
        }

        var memberCount = await _context.TeamMembers
            .CountAsync(tm => tm.TeamId == request.TeamId, cancellationToken);

        return new TeamResponse
        {
            Id = team.Id,
            Name = team.Name,
            OwnerId = team.OwnerId,
            CreatedAt = team.CreatedAt,
            Role = membership.Role.ToString(),
            MemberCount = memberCount
        };
    }
}
