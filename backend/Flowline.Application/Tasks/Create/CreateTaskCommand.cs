using MediatR;
using TaskStatus = Flowline.Domain.Enums.TaskStatus;

namespace Flowline.Application.Tasks.Create;

public sealed record CreateTaskCommand : IRequest<CreateTaskResponse>
{
    public required Guid UserId { get; init; }
    public Guid? TeamId { get; init; }
    public Guid? ProjectId { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public required string Color { get; init; }
    public required TaskStatus Status { get; init; }
    public required bool IsPrivate { get; init; }
}
