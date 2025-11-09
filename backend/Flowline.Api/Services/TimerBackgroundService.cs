using Flowline.Api.Hubs;
using Flowline.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Api.Services;

/// <summary>
/// Background service that periodically syncs timer updates
/// Sends OnTimerSync events every 30 seconds to maintain accuracy
/// Clients calculate elapsed time locally for real-time updates
/// </summary>
public class TimerBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHubContext<TimerHub> _hubContext;
    private readonly ILogger<TimerBackgroundService> _logger;

    public TimerBackgroundService(
        IServiceProvider serviceProvider,
        IHubContext<TimerHub> hubContext,
        ILogger<TimerBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Timer Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await BroadcastTimerUpdates(stoppingToken);

                // OPTIMIZATION: Broadcast every 30 seconds instead of every second
                // Clients calculate elapsed time locally, this is just for periodic sync
                await Task.Delay(30000, stoppingToken); // Wait 30 seconds
            }
            catch (OperationCanceledException)
            {
                // Service is stopping
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Timer Background Service");
                await Task.Delay(5000, stoppingToken); // Wait 5s before retry
            }
        }

        _logger.LogInformation("Timer Background Service stopped");
    }

    private async Task BroadcastTimerUpdates(CancellationToken cancellationToken)
    {
        var startTime = DateTime.UtcNow;

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        // OPTIMIZATION: Use AsNoTracking for read-only query
        // Get all running time entries (EndTime = null)
        var runningEntries = await dbContext.TimeEntries
            .AsNoTracking()
            .Include(e => e.Task)
            .Where(e => e.EndTime == null)
            .Select(e => new
            {
                e.Id,
                e.TaskId,
                e.StartTime,
                UserId = e.Task.UserId
            })
            .ToListAsync(cancellationToken);

        if (!runningEntries.Any())
        {
            _logger.LogDebug("No running timers to broadcast");
            return;
        }

        // Group by userId to send batch updates
        var entriesByUser = runningEntries.GroupBy(e => e.UserId);
        var broadcastCount = 0;

        foreach (var userGroup in entriesByUser)
        {
            var userId = userGroup.Key.ToString();
            var now = DateTime.UtcNow;

            // Send batch update to user's group
            var timerUpdates = userGroup.Select(entry => new
            {
                id = entry.Id,
                taskId = entry.TaskId,
                startTime = entry.StartTime,
                elapsedSeconds = (now - entry.StartTime).TotalSeconds
            }).ToList();

            // Broadcast to user's group - renamed from OnTimerTick to OnTimerSync
            await _hubContext.Clients.Group(userId)
                .SendAsync("OnTimerSync", timerUpdates, cancellationToken);

            broadcastCount++;
        }

        var elapsed = DateTime.UtcNow - startTime;
        _logger.LogInformation(
            "Timer sync broadcast completed: {UserCount} users, {TimerCount} timers, {ElapsedMs}ms",
            broadcastCount,
            runningEntries.Count,
            elapsed.TotalMilliseconds);
    }
}
