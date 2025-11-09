using Flowline.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Application.TimeEntries.GetAll;

public sealed class GetTimeEntriesHandler : IRequestHandler<GetTimeEntriesQuery, List<GetTimeEntriesResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetTimeEntriesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetTimeEntriesResponse>> Handle(
        GetTimeEntriesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.TimeEntries
            .Include(te => te.Task)
            .Where(te => te.Task.UserId == request.UserId);

        // Filter by specific date
        if (request.Date.HasValue)
        {
            var date = request.Date.Value.Date;
            query = query.Where(te => te.StartTime.Date == date);
        }
        // Filter by date range
        else if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            query = query.Where(te => te.StartTime >= request.StartDate.Value && te.StartTime <= request.EndDate.Value);
        }

        var timeEntries = await query
            .OrderBy(te => te.StartTime)
            .ToListAsync(cancellationToken);

        return timeEntries.Select(te => new GetTimeEntriesResponse
        {
            Id = te.Id,
            TaskId = te.TaskId,
            StartTime = te.StartTime,
            EndTime = te.EndTime,
            Notes = te.Notes,
            CreatedAt = te.CreatedAt,
            Task = new TaskInfo
            {
                Id = te.Task.Id,
                Title = te.Task.Title,
                Description = te.Task.Description,
                Color = te.Task.Color,
                Status = te.Task.Status.ToString()
            }
        }).ToList();
    }
}
