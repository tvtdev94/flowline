using MediatR;

namespace Flowline.Application.Projects.GetAll;

public sealed record GetProjectsQuery : IRequest<List<GetProjectsResponse>>
{
    public required Guid UserId { get; init; }
    public bool IncludeArchived { get; init; } = false;
}
