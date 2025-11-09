using Flowline.Domain.Entities;
using System.Security.Claims;

namespace Flowline.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
    ClaimsPrincipal? ValidateToken(string token);
}
