using DeviceManagement.Api.DTOs.Users;
using FluentValidation;

namespace DeviceManagement.Api.Validators.Users;

public class UserFilterRequestValidator : AbstractValidator<UserFilterRequest>
{
    public UserFilterRequestValidator()
    {
        RuleFor(x => x.Keyword)
            .MaximumLength(200);

        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}
