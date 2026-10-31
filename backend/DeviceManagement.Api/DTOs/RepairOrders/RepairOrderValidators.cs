using FluentValidation;

namespace DeviceManagement.Api.DTOs.RepairOrders;

public class CreateRepairOrderRequestValidator : AbstractValidator<CreateRepairOrderRequest>
{
    public CreateRepairOrderRequestValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty().WithMessage("Thiết bị không được để trống.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Mô tả sửa chữa không được để trống.");
        RuleFor(x => x.Priority).IsInEnum().WithMessage("Mức độ ưu tiên không hợp lệ.");
        RuleFor(x => x.EstimatedCost).GreaterThanOrEqualTo(0).When(x => x.EstimatedCost.HasValue).WithMessage("Chi phí dự tính không được âm.");
    }
}

public class UpdateRepairOrderStatusRequestValidator : AbstractValidator<UpdateRepairOrderStatusRequest>
{
    public UpdateRepairOrderStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum().WithMessage("Trạng thái sửa chữa không hợp lệ.");
        RuleFor(x => x.ActualCost).GreaterThanOrEqualTo(0).When(x => x.ActualCost.HasValue).WithMessage("Chi phí thực tế không được âm.");
        RuleFor(x => x.ResolutionNotes).MaximumLength(1000).WithMessage("Ghi chú xử lý không vượt quá 1000 ký tự.");
    }
}
