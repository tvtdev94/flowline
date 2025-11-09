using Microsoft.AspNetCore.SignalR;

namespace Flowline.Api.Hubs;

/// <summary>
/// SignalR Hub for real-time timer updates
/// Broadcasts timer ticks every second to connected clients
/// </summary>
public class TimerHub : Hub
{
    /// <summary>
    /// Called when a client connects to the hub
    /// Automatically adds the client to their user-specific group
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        // Get userId from query string (e.g., /hubs/timer?userId=123)
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            // Add connection to user-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub
    /// Automatically removes the client from their user-specific group
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Manually join a timer group (alternative to query string)
    /// Client calls: connection.invoke("JoinTimerGroup", userId)
    /// </summary>
    public async Task JoinTimerGroup(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, userId);
    }

    /// <summary>
    /// Manually leave a timer group
    /// Client calls: connection.invoke("LeaveTimerGroup", userId)
    /// </summary>
    public async Task LeaveTimerGroup(string userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
    }
}
