using MediatR;

namespace Flowline.Application.TimeEntries.Stop;

public sealed record StopTimerCommand : IRequest<StopTimerResponse>
{
    public required Guid TimeEntryId { get; init; }
}
