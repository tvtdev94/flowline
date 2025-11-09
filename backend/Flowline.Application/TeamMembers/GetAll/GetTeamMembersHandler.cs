using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.TeamMembers.GetAll;

public sealed class GetTeamMembersHandler : IRequestHandler<GetTeamMembersQuery, List<TeamMemberResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetTeamMembersHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TeamMemberResponse>> Handle(
        GetTeamMembersQuery request,
        CancellationToken cancellationToken)
    {
        // Check if requester is member of team
        var requesterIsMember = await _context.TeamMembers
            .AnyAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.RequesterId, cancellationToken);

        if (!requesterIsMember)
        {
            throw new UnauthorizedAccessException("User is not a member of this team");
        }

        var members = await _context.TeamMembers
            .Where(tm => tm.TeamId == request.TeamId)
            .Join(
                _context.Users,
                tm => tm.UserId,
                u => u.Id,
                (tm, u) => new TeamMemberResponse
                {
                    Id = tm.Id,
                    UserId = u.Id,
                    UserName = u.Name,
                    UserEmail = u.Email,
                    UserPicture = u.Picture,
                    Role = tm.Role.ToString(),
                    JoinedAt = tm.JoinedAt
                }
            )
            .OrderByDescending(m => m.Role) // Owner first
            .ThenBy(m => m.JoinedAt)
            .ToListAsync(cancellationToken);

        return members;
    }
}
