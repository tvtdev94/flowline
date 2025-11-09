using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Teams.Delete;

public sealed class DeleteTeamHandler : IRequestHandler<DeleteTeamCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteTeamHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(
        DeleteTeamCommand request,
        CancellationToken cancellationToken)
    {
        // Check if user is owner
        var membership = await _context.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.UserId, cancellationToken);

        if (membership == null || membership.Role != TeamRole.Owner)
        {
            throw new UnauthorizedAccessException("Only team owner can delete team");
        }

        var team = await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
        {
            throw new InvalidOperationException($"Team {request.TeamId} not found");
        }

        // Delete all team members first (foreign key constraint)
        var teamMembers = await _context.TeamMembers
            .Where(tm => tm.TeamId == request.TeamId)
            .ToListAsync(cancellationToken);

        _context.TeamMembers.RemoveRange(teamMembers);

        // Delete team
        _context.Teams.Remove(team);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
