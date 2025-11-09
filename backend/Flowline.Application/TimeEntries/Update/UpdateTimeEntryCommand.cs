using MediatR;

namespace Flowline.Application.TimeEntries.Update;

public sealed record UpdateTimeEntryCommand : IRequest<UpdateTimeEntryResponse>
{
    public required Guid TimeEntryId { get; init; }
    public DateTime? StartTime { get; init; }
    public DateTime? EndTime { get; init; }
    public string? Notes { get; init; }
}
