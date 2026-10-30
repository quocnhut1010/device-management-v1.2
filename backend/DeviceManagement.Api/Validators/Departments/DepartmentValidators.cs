using DeviceManagement.Api.DTOs.Departments;
using FluentValidation;

namespace DeviceManagement.Api.Validators.Departments;

public class CreateDepartmentRequestValidator : AbstractValidator<CreateDepartmentRequest>
{
    public CreateDepartmentRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã phòng ban không được để trống.")
            .MaximumLength(50).WithMessage("Mã phòng ban không được vượt quá 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên phòng ban không được để trống.")
            .MaximumLength(200).WithMessage("Tên phòng ban không được vượt quá 200 ký tự.");
    }
}

public class UpdateDepartmentRequestValidator : AbstractValidator<UpdateDepartmentRequest>
{
    public UpdateDepartmentRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã phòng ban không được để trống.")
            .MaximumLength(50).WithMessage("Mã phòng ban không được vượt quá 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên phòng ban không được để trống.")
            .MaximumLength(200).WithMessage("Tên phòng ban không được vượt quá 200 ký tự.");
    }
}
