using MediatR;

namespace Flowline.Application.TimeEntries.Start;

public sealed record StartTimerCommand : IRequest<StartTimerResponse>
{
    public required Guid TaskId { get; init; }
    public required Guid UserId { get; init; } // For validation
}
