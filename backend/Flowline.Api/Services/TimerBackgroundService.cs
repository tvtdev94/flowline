using Flowline.Api.Hubs;
using Flowline.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Api.Services;

/// <summary>
/// Background service that broadcasts timer updates every second
/// Sends OnTimerTick events to all connected clients with running timers
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
                await Task.Delay(1000, stoppingToken); // Wait 1 second
            }
            catch (OperationCanceledException)
            {
                // Service is stopping
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Timer Background Service");
                await Task.Delay(1000, stoppingToken); // Wait before retry
            }
        }

        _logger.LogInformation("Timer Background Service stopped");
    }

    private async Task BroadcastTimerUpdates(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        // Get all running time entries (EndTime = null)
        var runningEntries = await dbContext.TimeEntries
            .Include(e => e.Task)
            .Where(e => e.EndTime == null)
            .ToListAsync(cancellationToken);

        // Group by userId to send batch updates
        var entriesByUser = runningEntries.GroupBy(e => e.Task.UserId);

        foreach (var userGroup in entriesByUser)
        {
            var userId = userGroup.Key.ToString();

            // Send updates to all entries for this user
            foreach (var entry in userGroup)
            {
                var timerUpdate = new
                {
                    id = entry.Id,
                    taskId = entry.TaskId,
                    startTime = entry.StartTime,
                    duration = entry.Duration?.TotalSeconds ?? 0,
                    elapsedTime = DateTime.UtcNow - entry.StartTime
                };

                // Broadcast to user's group
                await _hubContext.Clients.Group(userId)
                    .SendAsync("OnTimerTick", timerUpdate, cancellationToken);
            }
        }
    }
}
