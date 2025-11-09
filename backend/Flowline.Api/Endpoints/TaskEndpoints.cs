using Flowline.Application.Tasks.Create;
using Flowline.Application.Tasks.Delete;
using Flowline.Application.Tasks.GetAll;
using Flowline.Application.Tasks.Update;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Flowline.Api.Endpoints;

public static class TaskEndpoints
{
    public static void MapTaskEndpoints(this IEndpointRouteBuilder app)
    {
        // Create Task
        app.MapPost("/api/tasks", async (
            [FromBody] CreateTaskCommand command,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Created($"/api/tasks/{result.Id}", result);
        })
        .WithName("CreateTask")
        .WithOpenApi();

        // Get Tasks
        app.MapGet("/api/tasks", async (
            [AsParameters] GetTasksQuery query,
            [FromServices] ISender sender) =>
        {
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("GetTasks")
        .WithOpenApi();

        // Update Task
        app.MapPut("/api/tasks/{id}", async (
            [FromRoute] Guid id,
            [FromBody] UpdateTaskCommand command,
            [FromServices] ISender sender) =>
        {
            var updatedCommand = command with { TaskId = id };
            var result = await sender.Send(updatedCommand);
            return Results.Ok(result);
        })
        .WithName("UpdateTask")
        .WithOpenApi();

        // Delete Task
        app.MapDelete("/api/tasks/{id}", async (
            [FromRoute] Guid id,
            [FromServices] ISender sender) =>
        {
            var command = new DeleteTaskCommand { TaskId = id };
            await sender.Send(command);
            return Results.NoContent();
        })
        .WithName("DeleteTask")
        .WithOpenApi();
    }
}
