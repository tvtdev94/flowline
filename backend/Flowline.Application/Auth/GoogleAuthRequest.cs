namespace Flowline.Application.Auth;

public sealed record GoogleAuthRequest
{
    public required string IdToken { get; init; }
}
