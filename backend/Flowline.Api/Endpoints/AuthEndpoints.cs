using Flowline.Application.Auth;
using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Flowline.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var auth = app.MapGroup("/api/auth")
            .WithTags("Authentication")
            .RequireRateLimiting("auth"); // Apply strict rate limiting to auth endpoints

        // Google OAuth Login
        auth.MapPost("/google", async (
            [FromBody] GoogleAuthRequest request,
            [FromServices] ISender sender,
            [FromServices] IConfiguration config) =>
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
        auth.MapPost("/dev-login", async (
            [FromServices] IConfiguration config,
            [FromServices] IApplicationDbContext context,
            [FromServices] IJwtService jwtService,
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
        auth.MapGet("/me", (HttpContext httpContext) =>
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

        // Health check (not in auth group)
        app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
           .WithName("HealthCheck")
           .WithTags("Health")
           .WithOpenApi()
           .AllowAnonymous();
    }
}
