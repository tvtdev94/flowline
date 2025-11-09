using MediatR;

namespace Flowline.Application.Projects.Update;

public sealed record UpdateProjectCommand : IRequest<UpdateProjectResponse>
{
    public Guid ProjectId { get; init; }
    public required Guid UserId { get; init; }
    public string? Name { get; init; }
    public string? Color { get; init; }
    public bool? IsArchived { get; init; }
}
