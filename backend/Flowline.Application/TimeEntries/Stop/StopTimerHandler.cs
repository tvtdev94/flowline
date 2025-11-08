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
        var updatedEntry = timeEntry with { EndTime = endTime };

        _context.TimeEntries.Update(updatedEntry);
        await _context.SaveChangesAsync(cancellationToken);

        return new StopTimerResponse
        {
            Id = updatedEntry.Id,
            EndTime = endTime,
            Duration = endTime - updatedEntry.StartTime
        };
    }
}
