using Flowline.Application;
using Flowline.Application.Tasks.Create;
using Flowline.Application.Tasks.GetAll;
using Flowline.Application.TimeEntries.Start;
using Flowline.Application.TimeEntries.Stop;
using Flowline.Infrastructure;
using MediatR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Application & Infrastructure layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173") // Vite default port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

// ==================== MINIMAL API ENDPOINTS ====================

// Health check
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
   .WithName("HealthCheck")
   .WithOpenApi();

// ==================== TASK ENDPOINTS ====================

// Create Task
app.MapPost("/api/tasks", async (CreateTaskCommand command, ISender sender) =>
{
    var result = await sender.Send(command);
    return Results.Created($"/api/tasks/{result.Id}", result);
})
.WithName("CreateTask")
.WithOpenApi();

// Get Tasks
app.MapGet("/api/tasks", async (Guid userId, Guid? projectId, ISender sender) =>
{
    var query = new GetTasksQuery
    {
        UserId = userId,
        ProjectId = projectId
    };

    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetTasks")
.WithOpenApi();

// ==================== TIME ENTRY ENDPOINTS ====================

// Start Timer
app.MapPost("/api/time-entries/start", async (StartTimerCommand command, ISender sender) =>
{
    var result = await sender.Send(command);
    return Results.Created($"/api/time-entries/{result.Id}", result);
})
.WithName("StartTimer")
.WithOpenApi();

// Stop Timer
app.MapPatch("/api/time-entries/{id}/stop", async (Guid id, ISender sender) =>
{
    var command = new StopTimerCommand { TimeEntryId = id };
    var result = await sender.Send(command);
    return Results.Ok(result);
})
.WithName("StopTimer")
.WithOpenApi();

app.Run();
