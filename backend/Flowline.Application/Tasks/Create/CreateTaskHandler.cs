using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Entities;
using MediatR;

namespace Flowline.Application.Tasks.Create;

public sealed class CreateTaskHandler : IRequestHandler<CreateTaskCommand, CreateTaskResponse>
{
    private readonly IApplicationDbContext _context;

    public CreateTaskHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateTaskResponse> Handle(
        CreateTaskCommand request,
        CancellationToken cancellationToken)
    {
        var task = new TaskEntity
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            TeamId = request.TeamId,
            ProjectId = request.ProjectId,
            Title = request.Title,
            Description = request.Description,
            Color = request.Color,
            Status = request.Status,
            IsPrivate = request.IsPrivate,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateTaskResponse
        {
            Id = task.Id,
            CreatedAt = task.CreatedAt
        };
    }
}
