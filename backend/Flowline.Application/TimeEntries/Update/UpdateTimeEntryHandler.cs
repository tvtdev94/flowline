using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.TimeEntries.Update;

public sealed class UpdateTimeEntryHandler : IRequestHandler<UpdateTimeEntryCommand, UpdateTimeEntryResponse>
{
    private readonly IApplicationDbContext _context;

    public UpdateTimeEntryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateTimeEntryResponse> Handle(
        UpdateTimeEntryCommand request,
        CancellationToken cancellationToken)
    {
        var timeEntry = await _context.TimeEntries
            .FirstOrDefaultAsync(te => te.Id == request.TimeEntryId, cancellationToken);

        if (timeEntry == null)
        {
            throw new InvalidOperationException($"TimeEntry {request.TimeEntryId} not found");
        }

        // Update mutable properties
        if (request.StartTime.HasValue)
        {
            timeEntry.StartTime = request.StartTime.Value;
        }

        if (request.EndTime.HasValue)
        {
            timeEntry.EndTime = request.EndTime.Value;
        }

        if (request.Notes != null)
        {
            timeEntry.Notes = request.Notes;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateTimeEntryResponse
        {
            Id = timeEntry.Id,
            StartTime = timeEntry.StartTime,
            EndTime = timeEntry.EndTime,
            Duration = timeEntry.Duration
        };
    }
}
