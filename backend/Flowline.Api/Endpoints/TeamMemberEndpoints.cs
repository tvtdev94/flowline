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
        var teamMembers = app.MapGroup("/api/teams/{teamId}/members")
            .WithTags("Team Members")
            .RequireAuthorization();

        // Add Team Member
        teamMembers.MapPost("", async (
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
        teamMembers.MapGet("", async (
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
        teamMembers.MapDelete("/{userId}", async (
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
