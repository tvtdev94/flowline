using FluentValidation;

namespace Flowline.Application.TimeEntries.Start;

public sealed class StartTimerValidator : AbstractValidator<StartTimerCommand>
{
    public StartTimerValidator()
    {
        RuleFor(x => x.TaskId)
            .NotEmpty()
            .WithMessage("TaskId is required");

        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("UserId is required");
    }
}
