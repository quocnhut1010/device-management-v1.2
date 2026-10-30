using DeviceManagement.Api.DTOs.DeviceAssignments;
using FluentValidation;

namespace DeviceManagement.Api.Validators.DeviceAssignments;

public class CreateDeviceAssignmentRequestValidator : AbstractValidator<CreateDeviceAssignmentRequest>
{
    public CreateDeviceAssignmentRequestValidator()
    {
        RuleFor(x => x.DeviceId)
            .NotEmpty();

        RuleFor(x => x.UserId)
            .NotEmpty();

        RuleFor(x => x.AssignedByUserId)
            .NotEmpty();

        RuleFor(x => x.Note)
            .MaximumLength(500);

        RuleFor(x => x)
            .Must(x => x.UserId != x.AssignedByUserId)
            .WithMessage("AssignedByUserId must be different from UserId.");
    }
}
