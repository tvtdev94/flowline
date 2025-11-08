using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.TimeEntries.Start;

public sealed class StartTimerHandler : IRequestHandler<StartTimerCommand, StartTimerResponse>
{
    private readonly IApplicationDbContext _context;

    public StartTimerHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StartTimerResponse> Handle(
        StartTimerCommand request,
        CancellationToken cancellationToken)
    {
        // Validate task exists and belongs to user
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.UserId == request.UserId, cancellationToken);

        if (task == null)
        {
            throw new InvalidOperationException($"Task {request.TaskId} not found or does not belong to user");
        }

        // Check if there's already a running timer for this task
        var runningTimer = await _context.TimeEntries
            .FirstOrDefaultAsync(te => te.TaskId == request.TaskId && te.EndTime == null, cancellationToken);

        if (runningTimer != null)
        {
            throw new InvalidOperationException($"Task {request.TaskId} already has a running timer");
        }

        // Create new time entry
        var timeEntry = new TimeEntry
        {
            Id = Guid.NewGuid(),
            TaskId = request.TaskId,
            StartTime = DateTime.UtcNow,
            EndTime = null, // null = running
            Notes = null,
            CreatedAt = DateTime.UtcNow
        };

        _context.TimeEntries.Add(timeEntry);
        await _context.SaveChangesAsync(cancellationToken);

        return new StartTimerResponse
        {
            Id = timeEntry.Id,
            TaskId = timeEntry.TaskId,
            StartTime = timeEntry.StartTime
        };
    }
}
