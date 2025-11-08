using FluentValidation;

namespace Flowline.Application.Tasks.Commands.CreateTask;

public sealed class CreateTaskValidator : AbstractValidator<CreateTaskCommand>
{
    public CreateTaskValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("UserId is required");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required")
            .MaximumLength(500)
            .WithMessage("Title must not exceed 500 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Color)
            .NotEmpty()
            .WithMessage("Color is required")
            .Matches(@"^#[0-9A-Fa-f]{6}$")
            .WithMessage("Color must be in hex format (#RRGGBB)");

        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Invalid task status");
    }
}
