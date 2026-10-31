using DeviceManagement.Api.DTOs.Users;
using FluentValidation;

namespace DeviceManagement.Api.Validators.Users;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Email)
            .NotEmpty()
            .MaximumLength(200)
            .EmailAddress();

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(30);

        RuleFor(x => x.Role)
            .Must(r => string.IsNullOrWhiteSpace(r) || r is "Admin" or "Employee" or "Technician")
            .WithMessage("Vai trò người dùng phải là Admin, Employee hoặc Technician.");
    }
}
