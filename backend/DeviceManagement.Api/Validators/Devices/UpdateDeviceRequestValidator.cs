using DeviceManagement.Api.DTOs.Devices;
using FluentValidation;

namespace DeviceManagement.Api.Validators.Devices;

public class UpdateDeviceRequestValidator : AbstractValidator<UpdateDeviceRequest>
{
    public UpdateDeviceRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

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
