using Flowline.Api.Hubs;
using Flowline.Api.Services;
using Flowline.Application;
using Flowline.Application.Tasks.Create;
using Flowline.Application.Tasks.GetAll;
using Flowline.Application.Tasks.Update;
using Flowline.Application.Tasks.Delete;
using Flowline.Application.TimeEntries.Start;
using Flowline.Application.TimeEntries.Stop;
using Flowline.Application.TimeEntries.GetAll;
using Flowline.Application.TimeEntries.Update;
using Flowline.Application.TimeEntries.Delete;
using Flowline.Application.Stats;
using Flowline.Application.Auth;
using Flowline.Application.Teams.Create;
using Flowline.Application.Teams.GetAll;
using Flowline.Application.Teams.GetById;
using Flowline.Application.Teams.Update;
using Flowline.Application.Teams.Delete;
using Flowline.Application.TeamMembers.Add;
using Flowline.Application.TeamMembers.Remove;
using Flowline.Application.TeamMembers.GetAll;
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
app.MapPost("/api/auth/google", async (GoogleAuthRequest request, ISender sender, IConfiguration config) =>
{
    var enableGoogleAuth = config.GetValue<bool>("Development:EnableGoogleAuth", true);

    if (!enableGoogleAuth)
    {
        // Development mode: bypass Google Auth
        return Results.BadRequest(new { error = "Google Auth is disabled. Use /api/auth/dev-login endpoint for development." });
    }

    var command = new GoogleAuthCommand { IdToken = request.IdToken };
    var result = await sender.Send(command);
    return Results.Ok(result);
})
.WithName("GoogleAuth")
.WithOpenApi()
.AllowAnonymous();

// Development Login (Only when Google Auth is disabled)
app.MapPost("/api/auth/dev-login", async (
    IConfiguration config,
    IApplicationDbContext context,
    IJwtService jwtService,
    CancellationToken cancellationToken) =>
{
    var enableGoogleAuth = config.GetValue<bool>("Development:EnableGoogleAuth", true);

    if (enableGoogleAuth)
    {
        return Results.BadRequest(new { error = "Development login is only available when Google Auth is disabled." });
    }

    // Get mock user from config
    var mockUserId = config.GetValue<Guid>("Development:MockUser:Id");
    var mockEmail = config.GetValue<string>("Development:MockUser:Email") ?? "dev@flowline.local";
    var mockName = config.GetValue<string>("Development:MockUser:Name") ?? "Development User";
    var mockGoogleId = config.GetValue<string>("Development:MockUser:GoogleId") ?? "dev-google-id";

    // Find or create mock user in database
    var user = await context.Users
        .FirstOrDefaultAsync(u => u.Id == mockUserId || u.Email == mockEmail, cancellationToken);

    if (user == null)
    {
        user = new User
        {
            Id = mockUserId,
            Email = mockEmail,
            Name = mockName,
            GoogleId = mockGoogleId,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };
        context.Users.Add(user);
    }
    else
    {
        user.LastLoginAt = DateTime.UtcNow;
    }

    await context.SaveChangesAsync(cancellationToken);

    // Generate JWT token
    var token = jwtService.GenerateToken(user);

    return Results.Ok(new
    {
        token,
        user = new
        {
            id = user.Id,
            email = user.Email,
            name = user.Name
        }
    });
})
.WithName("DevLogin")
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
app.MapGet("/api/tasks", async (Guid userId, Guid? projectId, Guid? teamId, bool includeTeamTasks, ISender sender) =>
{
    var query = new GetTasksQuery
    {
        UserId = userId,
        ProjectId = projectId,
        TeamId = teamId,
        IncludeTeamTasks = includeTeamTasks
    };

    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetTasks")
.WithOpenApi();

// Update Task
app.MapPut("/api/tasks/{id}", async (Guid id, UpdateTaskCommand command, ISender sender) =>
{
    var updatedCommand = command with { TaskId = id };
    var result = await sender.Send(updatedCommand);
    return Results.Ok(result);
})
.WithName("UpdateTask")
.WithOpenApi();

// Delete Task
app.MapDelete("/api/tasks/{id}", async (Guid id, ISender sender) =>
{
    var command = new DeleteTaskCommand { TaskId = id };
    await sender.Send(command);
    return Results.NoContent();
})
.WithName("DeleteTask")
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

// Update Time Entry
app.MapPut("/api/time-entries/{id}", async (Guid id, UpdateTimeEntryCommand command, ISender sender) =>
{
    var updatedCommand = command with { TimeEntryId = id };
    var result = await sender.Send(updatedCommand);
    return Results.Ok(result);
})
.WithName("UpdateTimeEntry")
.WithOpenApi();

// Delete Time Entry
app.MapDelete("/api/time-entries/{id}", async (Guid id, ISender sender) =>
{
    var command = new DeleteTimeEntryCommand { TimeEntryId = id };
    await sender.Send(command);
    return Results.NoContent();
})
.WithName("DeleteTimeEntry")
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

// Get Weekly Stats
app.MapGet("/api/stats/weekly", async (Guid userId, DateTime startDate, ISender sender) =>
{
    var query = new GetWeeklyStatsQuery
    {
        UserId = userId,
        StartDate = startDate
    };

    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetWeeklyStats")
.WithOpenApi();

// Get Monthly Stats
app.MapGet("/api/stats/monthly", async (Guid userId, int year, int month, ISender sender) =>
{
    var query = new GetMonthlyStatsQuery
    {
        UserId = userId,
        Year = year,
        Month = month
    };

    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetMonthlyStats")
.WithOpenApi();

// ==================== TEAM ENDPOINTS ====================

// Create Team
app.MapPost("/api/teams", async (CreateTeamCommand command, ISender sender) =>
{
    var result = await sender.Send(command);
    return Results.Created($"/api/teams/{result.Id}", result);
})
.WithName("CreateTeam")
.WithOpenApi();

// Get User's Teams
app.MapGet("/api/teams", async (Guid userId, ISender sender) =>
{
    var query = new GetTeamsQuery { UserId = userId };
    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetTeams")
.WithOpenApi();

// Get Team By Id
app.MapGet("/api/teams/{id}", async (Guid id, Guid userId, ISender sender) =>
{
    var query = new GetTeamByIdQuery { TeamId = id, UserId = userId };
    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetTeamById")
.WithOpenApi();

// Update Team
app.MapPut("/api/teams/{id}", async (Guid id, UpdateTeamCommand command, ISender sender) =>
{
    var updatedCommand = command with { TeamId = id };
    var result = await sender.Send(updatedCommand);
    return Results.Ok(result);
})
.WithName("UpdateTeam")
.WithOpenApi();

// Delete Team
app.MapDelete("/api/teams/{id}", async (Guid id, Guid userId, ISender sender) =>
{
    var command = new DeleteTeamCommand { TeamId = id, UserId = userId };
    await sender.Send(command);
    return Results.NoContent();
})
.WithName("DeleteTeam")
.WithOpenApi();

// ==================== TEAM MEMBER ENDPOINTS ====================

// Add Team Member
app.MapPost("/api/teams/{teamId}/members", async (Guid teamId, AddTeamMemberCommand command, ISender sender) =>
{
    var updatedCommand = command with { TeamId = teamId };
    var result = await sender.Send(updatedCommand);
    return Results.Created($"/api/teams/{teamId}/members/{result.Id}", result);
})
.WithName("AddTeamMember")
.WithOpenApi();

// Get Team Members
app.MapGet("/api/teams/{teamId}/members", async (Guid teamId, Guid userId, ISender sender) =>
{
    var query = new GetTeamMembersQuery { TeamId = teamId, RequesterId = userId };
    var result = await sender.Send(query);
    return Results.Ok(result);
})
.WithName("GetTeamMembers")
.WithOpenApi();

// Remove Team Member
app.MapDelete("/api/teams/{teamId}/members/{userId}", async (Guid teamId, Guid userId, Guid requesterId, ISender sender) =>
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

// ==================== SIGNALR HUB ====================

app.MapHub<TimerHub>("/hubs/timer");

app.Run();
