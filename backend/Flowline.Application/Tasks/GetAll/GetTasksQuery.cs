using MediatR;

namespace Flowline.Application.Tasks.GetAll;

public sealed record GetTasksQuery : IRequest<GetTasksResponse>
{
    public required Guid UserId { get; init; }
    public Guid? ProjectId { get; init; }
    public Guid? TeamId { get; init; } // null = personal tasks only, set = team tasks only
    public bool IncludeTeamTasks { get; init; } = false; // If true, include both personal and team tasks
}
