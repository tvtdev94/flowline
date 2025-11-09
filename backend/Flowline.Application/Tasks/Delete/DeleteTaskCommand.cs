using MediatR;

namespace Flowline.Application.Tasks.Delete;

public sealed record DeleteTaskCommand : IRequest<Unit>
{
    public required Guid TaskId { get; init; }
}
