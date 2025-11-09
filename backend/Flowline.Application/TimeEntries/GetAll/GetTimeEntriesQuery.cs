using MediatR;

namespace Flowline.Application.TimeEntries.GetAll;

public sealed record GetTimeEntriesQuery : IRequest<List<GetTimeEntriesResponse>>
{
    public required Guid UserId { get; init; }
    public DateTime? Date { get; init; } // Optional: filter by specific date
    public DateTime? StartDate { get; init; } // Optional: date range start
    public DateTime? EndDate { get; init; } // Optional: date range end
}
