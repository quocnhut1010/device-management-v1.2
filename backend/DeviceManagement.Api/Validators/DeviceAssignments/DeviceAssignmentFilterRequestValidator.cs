using DeviceManagement.Api.DTOs.DeviceAssignments;
using FluentValidation;

namespace DeviceManagement.Api.Validators.DeviceAssignments;

public class DeviceAssignmentFilterRequestValidator : AbstractValidator<DeviceAssignmentFilterRequest>
{
    public DeviceAssignmentFilterRequestValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}
