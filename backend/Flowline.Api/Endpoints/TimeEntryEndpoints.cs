using Flowline.Application.TimeEntries.Delete;
using Flowline.Application.TimeEntries.GetAll;
using Flowline.Application.TimeEntries.Start;
using Flowline.Application.TimeEntries.Stop;
using Flowline.Application.TimeEntries.Update;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Flowline.Api.Endpoints;

public static class TimeEntryEndpoints
{
    public static void MapTimeEntryEndpoints(this IEndpointRouteBuilder app)
    {
        var timeEntries = app.MapGroup("/api/time-entries")
            .WithTags("Time Entries")
            .RequireAuthorization();

        // Start Timer
        timeEntries.MapPost("/start", async (
            [FromBody] StartTimerCommand command,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Created($"/api/time-entries/{result.Id}", result);
        })
        .WithName("StartTimer")
        .WithOpenApi();

        // Stop Timer
        timeEntries.MapPatch("/{id}/stop", async (
            [FromRoute] Guid id,
            [FromServices] ISender sender) =>
        {
            var command = new StopTimerCommand { TimeEntryId = id };
            var result = await sender.Send(command);
            return Results.Ok(result);
        })
        .WithName("StopTimer")
        .WithOpenApi();

        // Get Time Entries
        timeEntries.MapGet("", async (
            [AsParameters] GetTimeEntriesQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetTimeEntries")
        .WithOpenApi();

        // Get Running Timers
        timeEntries.MapGet("/running", async (
            [FromQuery] Guid userId,
            [FromServices] ISender sender) =>
        {
            var query = new GetTimeEntriesQuery
            {
                UserId = userId,
                Date = DateTime.UtcNow.Date // Today only
            };

            var result = await sender.Send(query);
            // Filter only running timers (EndTime == null)
            var runningTimers = result.Where(te => te.EndTime == null).ToList();
            return Results.Ok(runningTimers);
        })
        .WithName("GetRunningTimers")
        .WithOpenApi();

        // Update Time Entry
        timeEntries.MapPut("/{id}", async (
            [FromRoute] Guid id,
            [FromBody] UpdateTimeEntryCommand command,
            [FromServices] ISender sender) =>
        {
            var updatedCommand = command with { TimeEntryId = id };
            var result = await sender.Send(updatedCommand);
            return Results.Ok(result);
        })
        .WithName("UpdateTimeEntry")
        .WithOpenApi();

        // Delete Time Entry
        timeEntries.MapDelete("/{id}", async (
            [FromRoute] Guid id,
            [FromServices] ISender sender) =>
        {
            var command = new DeleteTimeEntryCommand { TimeEntryId = id };
            await sender.Send(command);
            return Results.NoContent();
        })
        .WithName("DeleteTimeEntry")
        .WithOpenApi();
    }
}
