using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Entities;
using Flowline.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.TeamMembers.Add;

public sealed class AddTeamMemberHandler : IRequestHandler<AddTeamMemberCommand, AddTeamMemberResponse>
{
    private readonly IApplicationDbContext _context;

    public AddTeamMemberHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AddTeamMemberResponse> Handle(
        AddTeamMemberCommand request,
        CancellationToken cancellationToken)
    {
        // Check if requester is owner
        var requesterMembership = await _context.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.RequesterId, cancellationToken);

        if (requesterMembership == null || requesterMembership.Role != TeamRole.Owner)
        {
            throw new UnauthorizedAccessException("Only team owner can add members");
        }

        // Check if user already member
        var existingMembership = await _context.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.UserIdToAdd, cancellationToken);

        if (existingMembership != null)
        {
            throw new InvalidOperationException("User is already a member of this team");
        }

        // Check if user exists
        var userExists = await _context.Users
            .AnyAsync(u => u.Id == request.UserIdToAdd, cancellationToken);

        if (!userExists)
        {
            throw new InvalidOperationException($"User {request.UserIdToAdd} not found");
        }

        // Parse role
        if (!Enum.TryParse<TeamRole>(request.Role, out var role))
        {
            role = TeamRole.Member;
        }

        var teamMember = new TeamMember
        {
            Id = Guid.NewGuid(),
            TeamId = request.TeamId,
            UserId = request.UserIdToAdd,
            Role = role,
            JoinedAt = DateTime.UtcNow
        };

        _context.TeamMembers.Add(teamMember);
        await _context.SaveChangesAsync(cancellationToken);

        return new AddTeamMemberResponse
        {
            Id = teamMember.Id,
            TeamId = teamMember.TeamId,
            UserId = teamMember.UserId,
            Role = teamMember.Role.ToString(),
            JoinedAt = teamMember.JoinedAt
        };
    }
}
