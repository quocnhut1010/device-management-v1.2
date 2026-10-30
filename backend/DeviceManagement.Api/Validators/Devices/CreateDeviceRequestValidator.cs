using DeviceManagement.Api.DTOs.Devices;
using FluentValidation;

namespace DeviceManagement.Api.Validators.Devices;

public class CreateDeviceRequestValidator : AbstractValidator<CreateDeviceRequest>
{
    public CreateDeviceRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.SerialNumber)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Category)
            .MaximumLength(100);

        RuleFor(x => x.Model)
            .MaximumLength(100);

        RuleFor(x => x.PurchasedDate)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .When(x => x.PurchasedDate.HasValue)
            .WithMessage("PurchasedDate cannot be in the future.");
    }
}
