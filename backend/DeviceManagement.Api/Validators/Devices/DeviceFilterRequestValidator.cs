using DeviceManagement.Api.DTOs.Devices;
using FluentValidation;

namespace DeviceManagement.Api.Validators.Devices;

public class DeviceFilterRequestValidator : AbstractValidator<DeviceFilterRequest>
{
    public DeviceFilterRequestValidator()
    {
        RuleFor(x => x.Keyword)
            .MaximumLength(200);

        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}
