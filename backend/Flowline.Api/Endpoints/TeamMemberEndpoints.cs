using Flowline.Application.TeamMembers.Add;
using Flowline.Application.TeamMembers.GetAll;
using Flowline.Application.TeamMembers.Remove;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Flowline.Api.Endpoints;

public static class TeamMemberEndpoints
{
    public static void MapTeamMemberEndpoints(this IEndpointRouteBuilder app)
    {
        // Add Team Member
        app.MapPost("/api/teams/{teamId}/members", async (
            [FromRoute] Guid teamId,
            [FromBody] AddTeamMemberCommand command,
            [FromServices] ISender sender) =>
        {
            var updatedCommand = command with { TeamId = teamId };
            var result = await sender.Send(updatedCommand);
            return Results.Created($"/api/teams/{teamId}/members/{result.Id}", result);
        })
        .WithName("AddTeamMember")
        .WithOpenApi();

        // Get Team Members
        app.MapGet("/api/teams/{teamId}/members", async (
            [FromRoute] Guid teamId,
            [FromQuery] Guid userId,
            [FromServices] ISender sender) =>
        {
            var query = new GetTeamMembersQuery { TeamId = teamId, RequesterId = userId };
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetTeamMembers")
        .WithOpenApi();

        // Remove Team Member
        app.MapDelete("/api/teams/{teamId}/members/{userId}", async (
            [FromRoute] Guid teamId,
            [FromRoute] Guid userId,
            [FromQuery] Guid requesterId,
            [FromServices] ISender sender) =>
        {
            var command = new RemoveTeamMemberCommand
            {
                TeamId = teamId,
                UserIdToRemove = userId,
                RequesterId = requesterId
            };
            await sender.Send(command);
            return Results.NoContent();
        })
        .WithName("RemoveTeamMember")
        .WithOpenApi();
    }
}
