using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.TimeEntries.Delete;

public sealed class DeleteTimeEntryHandler : IRequestHandler<DeleteTimeEntryCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteTimeEntryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(
        DeleteTimeEntryCommand request,
        CancellationToken cancellationToken)
    {
        var timeEntry = await _context.TimeEntries
            .FirstOrDefaultAsync(te => te.Id == request.TimeEntryId, cancellationToken);

        if (timeEntry == null)
        {
            throw new InvalidOperationException($"TimeEntry {request.TimeEntryId} not found");
        }

        _context.TimeEntries.Remove(timeEntry);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
