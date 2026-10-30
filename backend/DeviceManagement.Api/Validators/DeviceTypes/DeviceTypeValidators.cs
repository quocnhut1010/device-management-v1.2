using DeviceManagement.Api.DTOs.DeviceTypes;
using FluentValidation;

namespace DeviceManagement.Api.Validators.DeviceTypes;

public class CreateDeviceTypeRequestValidator : AbstractValidator<CreateDeviceTypeRequest>
{
    public CreateDeviceTypeRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã loại thiết bị không được để trống.")
            .MaximumLength(50).WithMessage("Mã loại thiết bị không được vượt quá 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên loại thiết bị không được để trống.")
            .MaximumLength(100).WithMessage("Tên loại thiết bị không được vượt quá 100 ký tự.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Mô tả không được vượt quá 500 ký tự.");
    }
}

public class UpdateDeviceTypeRequestValidator : AbstractValidator<UpdateDeviceTypeRequest>
{
    public UpdateDeviceTypeRequestValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã loại thiết bị không được để trống.")
            .MaximumLength(50).WithMessage("Mã loại thiết bị không được vượt quá 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên loại thiết bị không được để trống.")
            .MaximumLength(100).WithMessage("Tên loại thiết bị không được vượt quá 100 ký tự.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Mô tả không được vượt quá 500 ký tự.");
    }
}
