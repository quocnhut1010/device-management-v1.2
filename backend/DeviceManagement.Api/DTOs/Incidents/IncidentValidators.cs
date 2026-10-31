using FluentValidation;

namespace DeviceManagement.Api.DTOs.Incidents;

public class CreateIncidentRequestValidator : AbstractValidator<CreateIncidentRequest>
{
    public CreateIncidentRequestValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty().WithMessage("Thiết bị không được để trống.");
        RuleFor(x => x.Title).NotEmpty().WithMessage("Tiêu đề sự cố không được để trống.").MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().WithMessage("Mô tả sự cố không được để trống.");
    }
}

public class UpdateIncidentStatusRequestValidator : AbstractValidator<UpdateIncidentStatusRequest>
{
    public UpdateIncidentStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum().WithMessage("Trạng thái sự cố không hợp lệ.");
        RuleFor(x => x.ResolutionNotes).MaximumLength(1000).WithMessage("Ghi chú xử lý không vượt quá 1000 ký tự.");
    }
}
