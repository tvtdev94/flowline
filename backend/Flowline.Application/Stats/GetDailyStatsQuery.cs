using MediatR;

namespace Flowline.Application.Stats;

public sealed record GetDailyStatsQuery : IRequest<DailyStatsResponse>
{
    public required Guid UserId { get; init; }
    public required DateTime Date { get; init; }
}
