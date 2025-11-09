using Flowline.Api.Hubs;
using Flowline.Api.Services;
using Flowline.Application;
using Flowline.Application.Tasks.Create;
using Flowline.Application.Tasks.GetAll;
using Flowline.Application.TimeEntries.Start;
using Flowline.Application.TimeEntries.Stop;
using Flowline.Application.TimeEntries.GetAll;
using Flowline.Application.Stats;
using Flowline.Application.Auth;
using Flowline.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Application & Infrastructure layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "default-secret-key-change-in-production-min-32-chars";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "flowline-api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "flowline-app";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // SignalR support - allow token from query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Add SignalR
builder.Services.AddSignalR();

// Add Timer Background Service
builder.Services.AddHostedService<TimerBackgroundService>();

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

// Add Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// ==================== MINIMAL API ENDPOINTS ====================

// ==================== AUTH ENDPOINTS ====================

// Google OAuth Login
app.MapPost("/api/auth/google", async (GoogleAuthRequest request, ISender sender) =>
{
    var command = new GoogleAuthCommand { IdToken = request.IdToken };
    var result = await sender.Send(command);
    return Results.Ok(result);
})
.WithName("GoogleAuth")
.WithOpenApi()
.AllowAnonymous();

// Get Current User
app.MapGet("/api/auth/me", (HttpContext httpContext) =>
{
    var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    var email = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
    var name = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

    if (userId == null)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new
    {
        id = userId,
        email,
        name
    });
})
.WithName("GetMe")
.WithOpenApi()
.RequireAuthorization();

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

// Get Time Entries
app.MapGet("/api/time-entries", async (Guid userId, DateTime? date, DateTime? startDate, DateTime? endDate, ISender sender) =>
{
    var query = new GetTimeEntriesQuery
    {
        UserId = userId,
        Date = date,
        StartDate = startDate,
        EndDate = endDate
    };

    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetTimeEntries")
.WithOpenApi();

// Get Running Timers
app.MapGet("/api/time-entries/running", async (Guid userId, ISender sender) =>
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

// ==================== STATS ENDPOINTS ====================

// Get Daily Stats
app.MapGet("/api/stats/daily", async (Guid userId, DateTime date, ISender sender) =>
{
    var query = new GetDailyStatsQuery
    {
        UserId = userId,
        Date = date
    };

    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetDailyStats")
.WithOpenApi();

// ==================== SIGNALR HUB ====================

app.MapHub<TimerHub>("/hubs/timer");

app.Run();
