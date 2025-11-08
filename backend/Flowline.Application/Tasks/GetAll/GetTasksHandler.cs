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
        var query = _context.Tasks
            .Where(t => t.UserId == request.UserId);

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
                ProjectId = t.ProjectId,
                Title = t.Title,
                Description = t.Description,
                Color = t.Color,
                Status = t.Status,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new GetTasksResponse
        {
            Tasks = tasks
        };
    }
}
