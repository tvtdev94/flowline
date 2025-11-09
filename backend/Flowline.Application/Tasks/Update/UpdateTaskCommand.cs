using MediatR;
using TaskStatus = Flowline.Domain.Enums.TaskStatus;

namespace Flowline.Application.Tasks.Update;

public sealed record UpdateTaskCommand : IRequest<UpdateTaskResponse>
{
    public required Guid TaskId { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Color { get; init; }
    public TaskStatus? Status { get; init; }
}
