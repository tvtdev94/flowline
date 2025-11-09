using MediatR;

namespace Flowline.Application.Projects.Create;

public sealed record CreateProjectCommand : IRequest<CreateProjectResponse>
{
    public required Guid UserId { get; init; }
    public required string Name { get; init; }
    public required string Color { get; init; }
}
