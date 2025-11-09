using Flowline.Application.Projects.Create;
using Flowline.Application.Projects.Delete;
using Flowline.Application.Projects.GetAll;
using Flowline.Application.Projects.Update;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Flowline.Api.Endpoints;

public static class ProjectEndpoints
{
    public static void MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        var projects = app.MapGroup("/api/projects")
            .WithTags("Projects")
            .RequireAuthorization();

        // Create Project
        projects.MapPost("", async (
            [FromBody] CreateProjectCommand command,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Created($"/api/projects/{result.Id}", result);
        })
        .WithName("CreateProject")
        .WithOpenApi();

        // Get User's Projects
        projects.MapGet("", async (
            [AsParameters] GetProjectsQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetProjects")
        .WithOpenApi();

        // Update Project
        projects.MapPut("/{id}", async (
            [FromRoute] Guid id,
            [FromBody] UpdateProjectCommand command,
            [FromServices] ISender sender) =>
        {
            var updatedCommand = command with { ProjectId = id };
            var result = await sender.Send(updatedCommand);
            return Results.Ok(result);
        })
        .WithName("UpdateProject")
        .WithOpenApi();

        // Delete Project
        projects.MapDelete("/{id}", async (
            [FromRoute] Guid id,
            [FromQuery] Guid userId,
            [FromServices] ISender sender) =>
        {
            var command = new DeleteProjectCommand
            {
                ProjectId = id,
                UserId = userId
            };
            await sender.Send(command);
            return Results.NoContent();
        })
        .WithName("DeleteProject")
        .WithOpenApi();
    }
}
