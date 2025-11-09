using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Teams.GetAll;

public sealed class GetTeamsHandler : IRequestHandler<GetTeamsQuery, List<TeamResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetTeamsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TeamResponse>> Handle(
        GetTeamsQuery request,
        CancellationToken cancellationToken)
    {
        // Get all teams where user is a member
        var userTeams = await _context.TeamMembers
            .Where(tm => tm.UserId == request.UserId)
            .Join(
                _context.Teams,
                tm => tm.TeamId,
                t => t.Id,
                (tm, t) => new { Team = t, UserRole = tm.Role }
            )
            .Select(x => new
            {
                x.Team,
                x.UserRole,
                MemberCount = _context.TeamMembers.Count(tm => tm.TeamId == x.Team.Id)
            })
            .ToListAsync(cancellationToken);

        return userTeams.Select(x => new TeamResponse
        {
            Id = x.Team.Id,
            Name = x.Team.Name,
            OwnerId = x.Team.OwnerId,
            CreatedAt = x.Team.CreatedAt,
            Role = x.UserRole.ToString(),
            MemberCount = x.MemberCount
        }).ToList();
    }
}
