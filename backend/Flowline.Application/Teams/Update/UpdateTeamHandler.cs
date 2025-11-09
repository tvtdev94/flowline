using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Teams.Update;

public sealed class UpdateTeamHandler : IRequestHandler<UpdateTeamCommand, UpdateTeamResponse>
{
    private readonly IApplicationDbContext _context;

    public UpdateTeamHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateTeamResponse> Handle(
        UpdateTeamCommand request,
        CancellationToken cancellationToken)
    {
        // Check if user is owner
        var membership = await _context.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId && tm.UserId == request.UserId, cancellationToken);

        if (membership == null || membership.Role != TeamRole.Owner)
        {
            throw new UnauthorizedAccessException("Only team owner can update team");
        }

        var team = await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == request.TeamId, cancellationToken);

        if (team == null)
        {
            throw new InvalidOperationException($"Team {request.TeamId} not found");
        }

        // Update name
        team.Name = request.Name;
        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateTeamResponse
        {
            Id = team.Id,
            Name = team.Name
        };
    }
}
