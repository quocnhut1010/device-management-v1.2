using DeviceManagement.Api.DTOs.DeviceModels;
using FluentValidation;

namespace DeviceManagement.Api.Validators.DeviceModels;

public class CreateDeviceModelRequestValidator : AbstractValidator<CreateDeviceModelRequest>
{
    public CreateDeviceModelRequestValidator()
    {
        RuleFor(x => x.DeviceTypeId)
            .NotEmpty().WithMessage("Vui lòng chọn loại thiết bị.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã dòng máy không được để trống.")
            .MaximumLength(50).WithMessage("Mã dòng máy không được vượt quá 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên dòng máy không được để trống.")
            .MaximumLength(100).WithMessage("Tên dòng máy không được vượt quá 100 ký tự.");

        RuleFor(x => x.Manufacturer)
            .MaximumLength(100).WithMessage("Hãng sản xuất không được vượt quá 100 ký tự.");
    }
}

public class UpdateDeviceModelRequestValidator : AbstractValidator<UpdateDeviceModelRequest>
{
    public UpdateDeviceModelRequestValidator()
    {
        RuleFor(x => x.DeviceTypeId)
            .NotEmpty().WithMessage("Vui lòng chọn loại thiết bị.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã dòng máy không được để trống.")
            .MaximumLength(50).WithMessage("Mã dòng máy không được vượt quá 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên dòng máy không được để trống.")
            .MaximumLength(100).WithMessage("Tên dòng máy không được vượt quá 100 ký tự.");

        RuleFor(x => x.Manufacturer)
            .MaximumLength(100).WithMessage("Hãng sản xuất không được vượt quá 100 ký tự.");
    }
}
