using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.Tasks.Update;

public sealed class UpdateTaskHandler : IRequestHandler<UpdateTaskCommand, UpdateTaskResponse>
{
    private readonly IApplicationDbContext _context;

    public UpdateTaskHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateTaskResponse> Handle(
        UpdateTaskCommand request,
        CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            throw new InvalidOperationException($"Task {request.TaskId} not found");
        }

        // Update only provided fields
        if (request.Title != null)
        {
            task.Title = request.Title;
        }

        if (request.Description != null)
        {
            task.Description = request.Description;
        }

        if (request.Color != null)
        {
            task.Color = request.Color;
        }

        if (request.Status.HasValue)
        {
            task.Status = request.Status.Value;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateTaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Color = task.Color,
            Status = task.Status.ToString(),
            UpdatedAt = DateTime.UtcNow
        };
    }
}
