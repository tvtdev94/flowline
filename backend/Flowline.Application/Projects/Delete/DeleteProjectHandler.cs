using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Projects.Delete;

public sealed class DeleteProjectHandler : IRequestHandler<DeleteProjectCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteProjectHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && p.UserId == request.UserId, cancellationToken);

        if (project == null)
        {
            throw new Exception($"Project with ID {request.ProjectId} not found");
        }

        // Check if there are tasks using this project
        var tasksCount = await _context.Tasks
            .CountAsync(t => t.ProjectId == request.ProjectId, cancellationToken);

        if (tasksCount > 0)
        {
            throw new Exception($"Cannot delete project. There are {tasksCount} tasks using this project.");
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
