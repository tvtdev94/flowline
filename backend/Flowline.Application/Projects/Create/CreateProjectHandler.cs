using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Entities;
using MediatR;

namespace Flowline.Application.Projects.Create;

public sealed class CreateProjectHandler : IRequestHandler<CreateProjectCommand, CreateProjectResponse>
{
    private readonly IApplicationDbContext _context;

    public CreateProjectHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateProjectResponse> Handle(
        CreateProjectCommand request,
        CancellationToken cancellationToken)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Name = request.Name,
            Color = request.Color,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateProjectResponse
        {
            Id = project.Id,
            CreatedAt = project.CreatedAt
        };
    }
}
