using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Projects.GetAll;

public sealed class GetProjectsHandler : IRequestHandler<GetProjectsQuery, List<GetProjectsResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetProjectsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetProjectsResponse>> Handle(
        GetProjectsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Projects
            .Where(p => p.UserId == request.UserId);

        if (!request.IncludeArchived)
        {
            query = query.Where(p => !p.IsArchived);
        }

        var projects = await query
            .OrderBy(p => p.Name)
            .Select(p => new GetProjectsResponse
            {
                Id = p.Id,
                UserId = p.UserId,
                Name = p.Name,
                Color = p.Color,
                IsArchived = p.IsArchived,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return projects;
    }
}
