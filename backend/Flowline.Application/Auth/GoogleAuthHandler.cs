using Flowline.Application.Common.Interfaces;
using Flowline.Domain.Entities;
using Google.Apis.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Flowline.Application.Auth;

public class GoogleAuthHandler : IRequestHandler<GoogleAuthCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IJwtService _jwtService;

    public GoogleAuthHandler(
        IApplicationDbContext context,
        IConfiguration configuration,
        IJwtService jwtService)
    {
        _context = context;
        _configuration = configuration;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> Handle(GoogleAuthCommand request, CancellationToken cancellationToken)
    {
        // Verify Google ID token
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _configuration["Google:ClientId"]
                ?? throw new InvalidOperationException("Google ClientId not configured") }
        };

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException("Invalid Google token", ex);
        }

        // Find or create user
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.GoogleId == payload.Subject, cancellationToken);

        if (user == null)
        {
            // Create new user
            user = new User
            {
                Id = Guid.NewGuid(),
                GoogleId = payload.Subject,
                Email = payload.Email,
                Name = payload.Name,
                Picture = payload.Picture,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
        }
        else
        {
            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Generate JWT
        var token = _jwtService.GenerateToken(user);

        return new AuthResponse
        {
            Token = token,
            User = new UserInfo
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Picture = user.Picture
            }
        };
    }
}
