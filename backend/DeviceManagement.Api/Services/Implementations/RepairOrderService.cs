using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.RepairOrders;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class RepairOrderService : IRepairOrderService
{
    private readonly IRepairOrderRepository _repairOrderRepository;
    private readonly IIncidentRepository _incidentRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IDeviceService _deviceService;
    private readonly IDeviceHistoryRepository _deviceHistoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public RepairOrderService(
        IRepairOrderRepository repairOrderRepository,
        IIncidentRepository incidentRepository,
        IDeviceRepository deviceRepository,
        IUserRepository userRepository,
        IDeviceService deviceService,
        IDeviceHistoryRepository deviceHistoryRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _repairOrderRepository = repairOrderRepository;
        _incidentRepository = incidentRepository;
        _deviceRepository = deviceRepository;
        _userRepository = userRepository;
        _deviceService = deviceService;
        _deviceHistoryRepository = deviceHistoryRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<RepairOrderDto>> GetAsync(RepairOrderFilterRequest request)
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        var isTechnician = _currentUserService.IsInRole("Technician");
        var currentUserId = _currentUserService.GetRequiredUserId();

        if (!isAdmin && !isTechnician)
        {
            throw new ForbiddenException("Chỉ Quản trị viên và Kỹ thuật viên mới có quyền xem danh sách sửa chữa.");
        }

        Guid? targetUserId = isAdmin ? request.AssignedToUserId : currentUserId;

        var result = await _repairOrderRepository.GetPagedAsync(
            request.Keyword,
            request.DeviceId,
            targetUserId,
            request.Status,
            request.Priority,
            request.Page,
            request.PageSize);

        return new PagedResult<RepairOrderDto>
        {
            Items = result.Items.Select(ToDto).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalItems = result.TotalItems
        };
    }

    public async Task<RepairOrderDto> GetByIdAsync(Guid id)
    {
        var order = await _repairOrderRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Lệnh sửa chữa không tồn tại.");

        var isAdmin = _currentUserService.IsInRole("Admin");
        var isTechnician = _currentUserService.IsInRole("Technician");
        var currentUserId = _currentUserService.GetRequiredUserId();

        if (!isAdmin && (!isTechnician || order.AssignedToUserId != currentUserId))
        {
            throw new ForbiddenException("Bạn không có quyền xem thông tin lệnh sửa chữa này.");
        }

        return ToDto(order);
    }

    public async Task<RepairOrderDto> CreateAsync(CreateRepairOrderRequest request)
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        if (!isAdmin)
        {
            throw new ForbiddenException("Chỉ Quản trị viên mới có quyền tạo lệnh sửa chữa.");
        }

        var device = await _deviceRepository.GetByIdAsync(request.DeviceId)
            ?? throw new NotFoundException("Thiết bị không tồn tại.");

        if (device.Status == DeviceStatus.Disposed)
        {
            throw new BusinessException("Không thể tạo lệnh sửa chữa cho thiết bị đã thanh lý.");
        }

        if (device.Status == DeviceStatus.UnderRepair || await _repairOrderRepository.HasActiveRepairForDeviceAsync(device.Id))
        {
            throw new BusinessException("Thiết bị này đang trong trạng thái sửa chữa hoặc có lệnh sửa chữa khác chưa hoàn tất.");
        }

        Incident? incident = null;
        if (request.IncidentId.HasValue)
        {
            incident = await _incidentRepository.GetByIdAsync(request.IncidentId.Value)
                ?? throw new NotFoundException("Sự cố được chỉ định không tồn tại.");

            if (incident.DeviceId != device.Id)
            {
                throw new BusinessException("Sự cố không thuộc về thiết bị đã chọn.");
            }

            if (incident.Status is not (IncidentStatus.InReview or IncidentStatus.Approved))
            {
                throw new BusinessException("Chỉ có thể tạo lệnh sửa chữa cho sự cố đang xem xét hoặc đã được phê duyệt.");
            }
        }

        User? assignedUser = null;
        if (request.AssignedToUserId.HasValue)
        {
            assignedUser = await _userRepository.GetByIdAsync(request.AssignedToUserId.Value)
                ?? throw new NotFoundException("Kỹ thuật viên được chỉ định không tồn tại.");

            if (assignedUser.Role is not ("Technician" or "Admin"))
            {
                throw new BusinessException("Người được phân công phải có vai trò Kỹ thuật viên (Technician).");
            }
        }

        string code;
        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            code = request.Code.Trim();
            if (await _repairOrderRepository.ExistsByCodeAsync(code))
            {
                throw new BusinessException($"Mã lệnh sửa chữa '{code}' đã tồn tại.");
            }
        }
        else
        {
            code = $"RO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        }

        var oldDeviceStatus = device.Status;
        var currentUserId = _currentUserService.GetRequiredUserId();

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        device.Status = DeviceStatus.UnderRepair;
        device.UpdatedAt = DateTime.UtcNow;
        _deviceRepository.Update(device);

        if (incident != null && incident.Status == IncidentStatus.InReview)
        {
            incident.Status = IncidentStatus.Approved;
            incident.UpdatedAt = DateTime.UtcNow;
            _incidentRepository.Update(incident);
        }

        var order = new RepairOrder
        {
            Id = Guid.NewGuid(),
            Code = code,
            IncidentId = request.IncidentId,
            DeviceId = request.DeviceId,
            AssignedToUserId = request.AssignedToUserId,
            Status = request.AssignedToUserId.HasValue ? RepairStatus.Assigned : RepairStatus.Pending,
            Priority = request.Priority,
            EstimatedCost = request.EstimatedCost,
            Description = request.Description.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _repairOrderRepository.AddAsync(order);
        await _deviceHistoryRepository.AddAsync(new DeviceHistory
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            Action = "RepairOrderCreated",
            OldStatus = oldDeviceStatus,
            NewStatus = DeviceStatus.UnderRepair,
            Description = $"Tạo lệnh sửa chữa '{order.Code}' (Mức độ: {order.Priority}). Thiết bị chuyển sang trạng thái Đang sửa chữa.",
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.SaveChangesAsync();

        await transaction.CommitAsync();

        order.Device = device;
        order.Incident = incident;
        order.AssignedToUser = assignedUser;

        return ToDto(order);
    }

    public async Task<RepairOrderDto> AssignTechnicianAsync(Guid id, AssignRepairOrderRequest request)
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        if (!isAdmin)
        {
            throw new ForbiddenException("Chỉ Quản trị viên mới có quyền phân công kỹ thuật viên.");
        }

        var order = await _repairOrderRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Lệnh sửa chữa không tồn tại.");

        var technician = await _userRepository.GetByIdAsync(request.AssignedToUserId)
            ?? throw new NotFoundException("Kỹ thuật viên không tồn tại.");

        if (technician.Role is not ("Technician" or "Admin"))
        {
            throw new BusinessException("Người được phân công phải có vai trò Kỹ thuật viên.");
        }

        order.AssignedToUserId = technician.Id;
        if (order.Status == RepairStatus.Pending)
        {
            order.Status = RepairStatus.Assigned;
        }
        order.UpdatedAt = DateTime.UtcNow;

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        _repairOrderRepository.Update(order);
        await _deviceHistoryRepository.AddAsync(new DeviceHistory
        {
            Id = Guid.NewGuid(),
            DeviceId = order.DeviceId,
            Action = "RepairOrderAssigned",
            OldStatus = order.Device.Status,
            NewStatus = order.Device.Status,
            Description = $"Lệnh sửa chữa '{order.Code}' được phân công cho kỹ thuật viên {technician.FullName}.",
            CreatedByUserId = _currentUserService.GetRequiredUserId(),
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();

        order.AssignedToUser = technician;
        return ToDto(order);
    }

    public async Task<RepairOrderDto> UpdateStatusAsync(Guid id, UpdateRepairOrderStatusRequest request)
    {
        var order = await _repairOrderRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Lệnh sửa chữa không tồn tại.");

        var isAdmin = _currentUserService.IsInRole("Admin");
        var isTechnician = _currentUserService.IsInRole("Technician");
        var currentUserId = _currentUserService.GetRequiredUserId();

        if (!isAdmin && (!isTechnician || order.AssignedToUserId != currentUserId))
        {
            throw new ForbiddenException("Bạn không có quyền cập nhật tiến độ lệnh sửa chữa này.");
        }

        if (request.Status == RepairStatus.Closed && !isAdmin)
        {
            throw new ForbiddenException("Chỉ Quản trị viên mới có quyền nghiệm thu và Đóng lệnh sửa chữa.");
        }

        if (order.Status != request.Status)
        {
            EnsureValidTransition(order.Status, request.Status);
            order.Status = request.Status;
        }

        if (request.ActualCost.HasValue)
        {
            order.ActualCost = request.ActualCost.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.ResolutionNotes))
        {
            order.ResolutionNotes = request.ResolutionNotes.Trim();
        }

        if (request.Status == RepairStatus.InProgress && !order.StartDate.HasValue)
        {
            order.StartDate = DateTime.UtcNow;
        }

        if (request.Status is RepairStatus.Completed or RepairStatus.Closed && !order.CompletedDate.HasValue)
        {
            order.CompletedDate = DateTime.UtcNow;
        }

        order.UpdatedAt = DateTime.UtcNow;

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        if (order.Incident != null && order.Incident.Status != IncidentStatus.Resolved &&
            request.Status is RepairStatus.Completed or RepairStatus.Closed)
        {
            order.Incident.Status = IncidentStatus.Resolved;
            order.Incident.ResolvedAt = DateTime.UtcNow;
            order.Incident.ResolutionNotes = order.ResolutionNotes;
            order.Incident.UpdatedAt = DateTime.UtcNow;
            _incidentRepository.Update(order.Incident);
        }

        _repairOrderRepository.Update(order);
        await _unitOfWork.SaveChangesAsync();

        if (request.Status is RepairStatus.Completed or RepairStatus.Closed or RepairStatus.Cancelled)
        {
            var hasOtherActiveRepairs = await _repairOrderRepository.HasActiveRepairForDeviceAsync(order.DeviceId, order.Id);
            if (!hasOtherActiveRepairs)
            {
                await _deviceService.RecalculateStatusAsync(order.DeviceId);
            }
        }

        var updatedDevice = await _deviceRepository.GetByIdAsync(order.DeviceId)
            ?? throw new NotFoundException("Thiết bị không tồn tại.");

        await _deviceHistoryRepository.AddAsync(new DeviceHistory
        {
            Id = Guid.NewGuid(),
            DeviceId = order.DeviceId,
            Action = "RepairStatusUpdated",
            OldStatus = order.Device.Status,
            NewStatus = updatedDevice.Status,
            Description = $"Lệnh sửa chữa '{order.Code}' cập nhật trạng thái sang {order.Status}. Chi phí thực tế: {(order.ActualCost.HasValue ? order.ActualCost.Value.ToString("N0") + " VND" : "Chưa có")}.",
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.SaveChangesAsync();

        await transaction.CommitAsync();

        order.Device = updatedDevice;
        return ToDto(order);
    }

    private static void EnsureValidTransition(RepairStatus current, RepairStatus next)
    {
        var isValid = current switch
        {
            RepairStatus.Pending => next is RepairStatus.Assigned or RepairStatus.InProgress or RepairStatus.Cancelled,
            RepairStatus.Assigned => next is RepairStatus.InProgress or RepairStatus.Cancelled,
            RepairStatus.InProgress => next is RepairStatus.PendingParts or RepairStatus.Completed or RepairStatus.Cancelled,
            RepairStatus.PendingParts => next is RepairStatus.InProgress or RepairStatus.Completed or RepairStatus.Cancelled,
            RepairStatus.Completed => next is RepairStatus.Closed,
            RepairStatus.Closed => false,
            RepairStatus.Cancelled => false,
            _ => false
        };

        if (!isValid)
        {
            throw new BusinessException($"Không thể chuyển trạng thái sửa chữa từ {current} sang {next}.");
        }
    }

    private static RepairOrderDto ToDto(RepairOrder x) =>
        new(
            x.Id,
            x.Code,
            x.IncidentId,
            x.Incident?.Title,
            x.DeviceId,
            x.Device?.Code,
            x.Device?.Name,
            x.AssignedToUserId,
            x.AssignedToUser?.FullName,
            x.Status,
            x.Priority,
            x.EstimatedCost,
            x.ActualCost,
            x.Description,
            x.ResolutionNotes,
            x.StartDate,
            x.CompletedDate,
            x.CreatedAt
        );
}
