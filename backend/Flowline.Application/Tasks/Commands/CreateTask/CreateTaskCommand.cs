using MediatR;
using TaskStatus = Flowline.Domain.Enums.TaskStatus;

namespace Flowline.Application.Tasks.Commands.CreateTask;

public sealed record CreateTaskCommand : IRequest<CreateTaskResponse>
{
    public required Guid UserId { get; init; }
    public Guid? ProjectId { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public required string Color { get; init; }
    public required TaskStatus Status { get; init; }
}
