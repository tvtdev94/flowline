using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.TimeEntries.Stop;

public sealed class StopTimerHandler : IRequestHandler<StopTimerCommand, StopTimerResponse>
{
    private readonly IApplicationDbContext _context;

    public StopTimerHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StopTimerResponse> Handle(
        StopTimerCommand request,
        CancellationToken cancellationToken)
    {
        var timeEntry = await _context.TimeEntries
            .FirstOrDefaultAsync(te => te.Id == request.TimeEntryId, cancellationToken);

        if (timeEntry == null)
        {
            throw new InvalidOperationException($"TimeEntry {request.TimeEntryId} not found");
        }

        if (timeEntry.EndTime != null)
        {
            throw new InvalidOperationException("Timer is already stopped");
        }

        var endTime = DateTime.UtcNow;

        // Update mutable property (EF Core will track changes)
        timeEntry.EndTime = endTime;

        await _context.SaveChangesAsync(cancellationToken);

        return new StopTimerResponse
        {
            Id = timeEntry.Id,
            EndTime = endTime,
            Duration = endTime - timeEntry.StartTime
        };
    }
}
