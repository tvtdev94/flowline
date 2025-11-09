using Flowline.Api.Endpoints;
using Flowline.Api.Hubs;
using Flowline.Api.Services;
using Flowline.Application;
using Flowline.Infrastructure;
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

builder.Services.AddAuthorization(options =>
{
    // Require authentication by default for all endpoints
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// Add SignalR
builder.Services.AddSignalR();

// Add Timer Background Service
builder.Services.AddHostedService<TimerBackgroundService>();

// Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    // Global API rate limit
    options.AddFixedWindowLimiter("api", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 60; // 60 requests per minute per IP
        opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 5;
    });

    // Stricter limit for auth endpoints (prevent brute force)
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 10; // 10 requests per minute
        opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 2;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

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

// Security Headers Middleware
app.Use(async (context, next) =>
{
    // Prevent clickjacking
    context.Response.Headers.Add("X-Frame-Options", "DENY");

    // Prevent MIME sniffing
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");

    // XSS Protection (legacy browsers)
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");

    // Referrer Policy
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy
    context.Response.Headers.Add("Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // Allow SignalR
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' ws: wss:; " + // Allow WebSocket for SignalR
        "font-src 'self' data:; " +
        "frame-ancestors 'none'");

    // Permissions Policy (formerly Feature-Policy)
    context.Response.Headers.Add("Permissions-Policy",
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");

    await next();
});

// Rate Limiting
app.UseRateLimiter();

// Add Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// ==================== MAP ENDPOINTS ====================

// Map all feature endpoints
app.MapAuthEndpoints(); // Has strict "auth" rate limiting (10 req/min)

// Apply global rate limiting to all other endpoints (60 req/min)
app.MapTaskEndpoints();
app.MapTimeEntryEndpoints();
app.MapStatsEndpoints();
app.MapTeamEndpoints();
app.MapTeamMemberEndpoints();
app.MapProjectEndpoints();

// ==================== SIGNALR HUB ====================

app.MapHub<TimerHub>("/hubs/timer");

app.Run();
