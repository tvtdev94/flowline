using Flowline.Application.Teams.Create;
using Flowline.Application.Teams.Delete;
using Flowline.Application.Teams.GetAll;
using Flowline.Application.Teams.GetById;
using Flowline.Application.Teams.Update;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Flowline.Api.Endpoints;

public static class TeamEndpoints
{
    public static void MapTeamEndpoints(this IEndpointRouteBuilder app)
    {
        // Create Team
        app.MapPost("/api/teams", async (
            [FromBody] CreateTeamCommand command,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Created($"/api/teams/{result.Id}", result);
        })
        .WithName("CreateTeam")
        .WithOpenApi();

        // Get User's Teams
        app.MapGet("/api/teams", async (
            [AsParameters] GetTeamsQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetTeams")
        .WithOpenApi();

        // Get Team By Id
        app.MapGet("/api/teams/{id}", async (
            [AsParameters] GetTeamByIdQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetTeamById")
        .WithOpenApi();

        // Update Team
        app.MapPut("/api/teams/{id}", async (
            [FromRoute] Guid id,
            [FromBody] UpdateTeamCommand command,
            [FromServices] ISender sender) =>
        {
            var updatedCommand = command with { TeamId = id };
            var result = await sender.Send(updatedCommand);
            return Results.Ok(result);
        })
        .WithName("UpdateTeam")
        .WithOpenApi();

        // Delete Team
        app.MapDelete("/api/teams/{id}", async (
            [FromRoute] Guid id,
            [FromQuery] Guid userId,
            [FromServices] ISender sender) =>
        {
            var command = new DeleteTeamCommand { TeamId = id, UserId = userId };
            await sender.Send(command);
            return Results.NoContent();
        })
        .WithName("DeleteTeam")
        .WithOpenApi();
    }
}
