using MediatR;

namespace Flowline.Application.Projects.Delete;

public sealed record DeleteProjectCommand : IRequest
{
    public required Guid ProjectId { get; init; }
    public required Guid UserId { get; init; }
}
