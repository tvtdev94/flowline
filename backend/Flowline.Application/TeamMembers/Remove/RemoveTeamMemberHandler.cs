using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.TeamMembers.Remove;

public sealed class RemoveTeamMemberHandler : IRequestHandler<RemoveTeamMemberCommand>
{
    private readonly IApplicationDbContext _context;

    public RemoveTeamMemberHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(
        RemoveTeamMemberCommand request,
        CancellationToken cancellationToken)
    {
        // Check if requester is owner
        var requesterMembership = await _context.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.RequesterId, cancellationToken);

        if (requesterMembership == null || requesterMembership.Role != TeamRole.Owner)
        {
            throw new UnauthorizedAccessException("Only team owner can remove members");
        }

        // Cannot remove owner
        var memberToRemove = await _context.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.UserIdToRemove, cancellationToken);

        if (memberToRemove == null)
        {
            throw new InvalidOperationException("User is not a member of this team");
        }

        if (memberToRemove.Role == TeamRole.Owner)
        {
            throw new InvalidOperationException("Cannot remove team owner");
        }

        _context.TeamMembers.Remove(memberToRemove);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
