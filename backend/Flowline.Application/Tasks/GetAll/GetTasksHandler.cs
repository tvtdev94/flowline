using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Tasks.GetAll;

public sealed class GetTasksHandler : IRequestHandler<GetTasksQuery, GetTasksResponse>
{
    private readonly IApplicationDbContext _context;

    public GetTasksHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetTasksResponse> Handle(
        GetTasksQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Tasks.AsQueryable();

        // Team filtering logic
        if (request.TeamId.HasValue)
        {
            // Get tasks for specific team only (not private)
            query = query.Where(t => t.TeamId == request.TeamId.Value && !t.IsPrivate);
        }
        else if (request.IncludeTeamTasks)
        {
            // Get user's personal tasks + all team tasks they have access to
            var userTeamIds = await _context.TeamMembers
                .Where(tm => tm.UserId == request.UserId)
                .Select(tm => tm.TeamId)
                .ToListAsync(cancellationToken);

            query = query.Where(t =>
                (t.UserId == request.UserId && t.TeamId == null) || // Personal tasks
                (t.TeamId != null && userTeamIds.Contains(t.TeamId.Value) && !t.IsPrivate) // Team tasks (not private)
            );
        }
        else
        {
            // Personal tasks only (default)
            query = query.Where(t => t.UserId == request.UserId && t.TeamId == null);
        }

        if (request.ProjectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == request.ProjectId.Value);
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                UserId = t.UserId,
                TeamId = t.TeamId,
                ProjectId = t.ProjectId,
                Title = t.Title,
                Description = t.Description,
                Color = t.Color,
                Status = t.Status,
                IsPrivate = t.IsPrivate,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new GetTasksResponse
        {
            Tasks = tasks
        };
    }
}
