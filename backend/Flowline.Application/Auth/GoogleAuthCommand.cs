using MediatR;

namespace Flowline.Application.Auth;

public sealed record GoogleAuthCommand : IRequest<AuthResponse>
{
    public required string IdToken { get; init; }
}
