namespace Flowline.Application.Auth;

public sealed record AuthResponse
{
    public required string Token { get; init; }
    public required UserInfo User { get; init; }
}

public sealed record UserInfo
{
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string Name { get; init; }
    public string? Picture { get; init; }
}
