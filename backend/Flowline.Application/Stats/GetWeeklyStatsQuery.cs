using MediatR;

namespace Flowline.Application.Stats;

public sealed record GetWeeklyStatsQuery : IRequest<WeeklyStatsResponse>
{
    public required Guid UserId { get; init; }
    public required DateTime StartDate { get; init; } // Start of week (Monday)
}
