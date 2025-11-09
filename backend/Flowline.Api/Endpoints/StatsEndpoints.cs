using Flowline.Application.Stats;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Flowline.Api.Endpoints;

public static class StatsEndpoints
{
    public static void MapStatsEndpoints(this IEndpointRouteBuilder app)
    {
        var stats = app.MapGroup("/api/stats")
            .WithTags("Statistics")
            .RequireAuthorization();

        // Get Daily Stats
        stats.MapGet("/daily", async (
            [AsParameters] GetDailyStatsQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetDailyStats")
        .WithOpenApi();

        // Get Weekly Stats
        stats.MapGet("/weekly", async (
            [AsParameters] GetWeeklyStatsQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetWeeklyStats")
        .WithOpenApi();

        // Get Monthly Stats
        stats.MapGet("/monthly", async (
            [AsParameters] GetMonthlyStatsQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetMonthlyStats")
        .WithOpenApi();
    }
}
