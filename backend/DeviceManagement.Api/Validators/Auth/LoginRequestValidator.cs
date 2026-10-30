using DeviceManagement.Api.DTOs.Auth;
using FluentValidation;

namespace DeviceManagement.Api.Validators.Auth;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .MaximumLength(200)
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty();
    }
}
