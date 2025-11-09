using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Projects.Update;

public sealed class UpdateProjectHandler : IRequestHandler<UpdateProjectCommand, UpdateProjectResponse>
{
    private readonly IApplicationDbContext _context;

    public UpdateProjectHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateProjectResponse> Handle(
        UpdateProjectCommand request,
        CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId && p.UserId == request.UserId, cancellationToken);

        if (project == null)
        {
            throw new Exception($"Project with ID {request.ProjectId} not found");
        }

        // Update fields if provided
        var updatedProject = project with
        {
            Name = request.Name ?? project.Name,
            Color = request.Color ?? project.Color,
            IsArchived = request.IsArchived ?? project.IsArchived
        };

        _context.Projects.Update(updatedProject);
        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateProjectResponse
        {
            Id = updatedProject.Id,
            Name = updatedProject.Name,
            Color = updatedProject.Color,
            IsArchived = updatedProject.IsArchived
        };
    }
}
