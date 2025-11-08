using MediatR;

namespace Flowline.Application.Tasks.GetAll;

public sealed record GetTasksQuery : IRequest<GetTasksResponse>
{
    public required Guid UserId { get; init; }
    public Guid? ProjectId { get; init; }
}
