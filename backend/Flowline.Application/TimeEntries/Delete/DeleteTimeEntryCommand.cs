using MediatR;

namespace Flowline.Application.TimeEntries.Delete;

public sealed record DeleteTimeEntryCommand : IRequest
{
    public required Guid TimeEntryId { get; init; }
}
