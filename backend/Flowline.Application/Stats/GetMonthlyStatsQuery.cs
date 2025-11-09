using MediatR;

namespace Flowline.Application.Stats;

public sealed record GetMonthlyStatsQuery : IRequest<MonthlyStatsResponse>
{
    public required Guid UserId { get; init; }
    public required int Year { get; init; }
    public required int Month { get; init; } // 1-12
}
