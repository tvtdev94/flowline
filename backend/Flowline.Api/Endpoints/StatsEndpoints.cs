using Flowline.Application.Stats;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Flowline.Api.Endpoints;

public static class StatsEndpoints
{
    public static void MapStatsEndpoints(this IEndpointRouteBuilder app)
    {
        // Get Daily Stats
        app.MapGet("/api/stats/daily", async (
            [AsParameters] GetDailyStatsQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetDailyStats")
        .WithOpenApi();

        // Get Weekly Stats
        app.MapGet("/api/stats/weekly", async (
            [AsParameters] GetWeeklyStatsQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetWeeklyStats")
        .WithOpenApi();

        // Get Monthly Stats
        app.MapGet("/api/stats/monthly", async (
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
