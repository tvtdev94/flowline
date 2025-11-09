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
        // Create Project
        app.MapPost("/api/projects", async (
            [FromBody] CreateProjectCommand command,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Created($"/api/projects/{result.Id}", result);
        })
        .WithName("CreateProject")
        .WithOpenApi();

        // Get User's Projects
        app.MapGet("/api/projects", async (
            [AsParameters] GetProjectsQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetProjects")
        .WithOpenApi();

        // Update Project
        app.MapPut("/api/projects/{id}", async (
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
        app.MapDelete("/api/projects/{id}", async (
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
