using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Devices;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class DeviceService : IDeviceService
{
    private readonly IDeviceRepository _repository;
    private readonly IDeviceTypeRepository _deviceTypeRepository;
    private readonly IDeviceModelRepository _deviceModelRepository;
    private readonly IDeviceAssignmentRepository _deviceAssignmentRepository;
    private readonly IDeviceHistoryRepository _deviceHistoryRepository;
    private readonly IRepairOrderRepository _repairOrderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeviceService(
        IDeviceRepository repository,
        IDeviceTypeRepository deviceTypeRepository,
        IDeviceModelRepository deviceModelRepository,
        IDeviceAssignmentRepository deviceAssignmentRepository,
        IDeviceHistoryRepository deviceHistoryRepository,
        IRepairOrderRepository repairOrderRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _deviceTypeRepository = deviceTypeRepository;
        _deviceModelRepository = deviceModelRepository;
        _deviceAssignmentRepository = deviceAssignmentRepository;
        _deviceHistoryRepository = deviceHistoryRepository;
        _repairOrderRepository = repairOrderRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<List<DeviceDto>> GetAsync() =>
        (await _repository.GetAsync()).Select(ToDto).ToList();

    public async Task<PagedResult<DeviceDto>> GetAsync(DeviceFilterRequest request)
    {
        var result = await _repository.GetPagedAsync(request.Keyword, request.Status, request.Page, request.PageSize);

        return new PagedResult<DeviceDto>
        {
            Items = result.Items.Select(ToDto).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalItems = result.TotalItems
        };
    }

    public async Task<DeviceDetailDto> GetByIdAsync(Guid id)
    {
        var device = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device not found.");

        return ToDetailDto(device);
    }

    public async Task<DeviceDto> CreateAsync(CreateDeviceRequest request)
    {
        if (await _repository.ExistsByCodeAsync(request.Code))
        {
            throw new BusinessException("Device code already exists.");
        }

        if (await _repository.ExistsBySerialNumberAsync(request.SerialNumber))
        {
            throw new BusinessException("Device serial number already exists.");
        }

        DeviceType? deviceType = null;
        DeviceModel? deviceModel = null;

        if (request.DeviceTypeId.HasValue)
        {
            deviceType = await _deviceTypeRepository.GetByIdAsync(request.DeviceTypeId.Value)
                ?? throw new NotFoundException("Loại thiết bị không tồn tại.");

            if (!deviceType.IsActive)
            {
                throw new BusinessException("Loại thiết bị đã bị vô hiệu hóa hoặc không hợp lệ.");
            }
        }

        if (request.DeviceModelId.HasValue)
        {
            deviceModel = await _deviceModelRepository.GetByIdAsync(request.DeviceModelId.Value)
                ?? throw new NotFoundException("Dòng máy (Model) không tồn tại.");

            if (!deviceModel.IsActive)
            {
                throw new BusinessException("Dòng máy (Model) đã bị vô hiệu hóa hoặc không hợp lệ.");
            }

            if (request.DeviceTypeId.HasValue && deviceModel.DeviceTypeId != request.DeviceTypeId.Value)
            {
                throw new BusinessException("Dòng máy (Model) không thuộc về loại thiết bị đã chọn.");
            }

            if (deviceType == null)
            {
                deviceType = deviceModel.DeviceType;
            }
        }

        var device = new Device
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            SerialNumber = request.SerialNumber,
            Category = deviceType != null ? deviceType.Name : request.Category,
            Model = deviceModel != null ? deviceModel.Name : request.Model,
            DeviceTypeId = deviceType?.Id,
            DeviceModelId = deviceModel?.Id,
            Status = DeviceStatus.Available,
            PurchasedDate = request.PurchasedDate,
            CreatedAt = DateTime.UtcNow
        };

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        await _repository.AddAsync(device);
        await _unitOfWork.SaveChangesAsync();

        await WriteHistoryAsync(
            device.Id,
            _currentUserService.GetUserId(),
            "DeviceCreated",
            null,
            device.Status,
            $"Tạo mới thiết bị '{device.Code}' - {device.Name}. Trạng thái ban đầu: Sẵn sàng sử dụng.");

        await transaction.CommitAsync();

        device.DeviceType = deviceType;
        device.DeviceModel = deviceModel;

        return ToDto(device);
    }

    public async Task<DeviceDto> UpdateAsync(Guid id, UpdateDeviceRequest request)
    {
        var device = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device not found.");

        DeviceType? deviceType = null;
        DeviceModel? deviceModel = null;

        if (request.DeviceTypeId.HasValue)
        {
            deviceType = await _deviceTypeRepository.GetByIdAsync(request.DeviceTypeId.Value)
                ?? throw new NotFoundException("Loại thiết bị không tồn tại.");

            if (!deviceType.IsActive)
            {
                throw new BusinessException("Loại thiết bị đã bị vô hiệu hóa hoặc không hợp lệ.");
            }
        }

        if (request.DeviceModelId.HasValue)
        {
            deviceModel = await _deviceModelRepository.GetByIdAsync(request.DeviceModelId.Value)
                ?? throw new NotFoundException("Dòng máy (Model) không tồn tại.");

            if (!deviceModel.IsActive)
            {
                throw new BusinessException("Dòng máy (Model) đã bị vô hiệu hóa hoặc không hợp lệ.");
            }

            if (request.DeviceTypeId.HasValue && deviceModel.DeviceTypeId != request.DeviceTypeId.Value)
            {
                throw new BusinessException("Dòng máy (Model) không thuộc về loại thiết bị đã chọn.");
            }

            if (deviceType == null)
            {
                deviceType = deviceModel.DeviceType;
            }
        }

        device.Name = request.Name;
        if (request.DeviceTypeId.HasValue)
        {
            device.DeviceTypeId = deviceType?.Id;
            device.Category = deviceType?.Name;
        }
        else if (request.Category != null)
        {
            device.Category = request.Category;
        }

        if (request.DeviceModelId.HasValue)
        {
            device.DeviceModelId = deviceModel?.Id;
            device.Model = deviceModel?.Name;
        }
        else if (request.Model != null)
        {
            device.Model = request.Model;
        }

        device.PurchasedDate = request.PurchasedDate;
        device.UpdatedAt = DateTime.UtcNow;

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        _repository.Update(device);
        await _unitOfWork.SaveChangesAsync();

        await WriteHistoryAsync(
            device.Id,
            _currentUserService.GetUserId(),
            "DeviceUpdated",
            device.Status,
            device.Status,
            $"Cập nhật thông tin thiết bị: Tên='{device.Name}', Loại='{device.Category}', Model='{device.Model}'.");

        await transaction.CommitAsync();

        device.DeviceType = deviceType;
        device.DeviceModel = deviceModel;

        return ToDto(device);
    }

    public async Task DeleteAsync(Guid id)
    {
        var device = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device not found.");

        if (await _repository.HasAssignmentsAsync(id))
        {
            throw new BusinessException("Cannot delete a device that has assignment history.");
        }

        await _deviceHistoryRepository.DeleteByDeviceIdAsync(id);

        _repository.Delete(device);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RecalculateStatusAsync(Guid id)
    {
        var device = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device not found.");

        var nextStatus = await DetermineStatusAsync(id, device.Status);
        if (nextStatus == device.Status)
        {
            return;
        }

        var oldStatus = device.Status;
        device.Status = nextStatus;
        device.UpdatedAt = DateTime.UtcNow;

        _repository.Update(device);
        await _deviceHistoryRepository.AddAsync(new DeviceHistory
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            Action = "StatusRecalculated",
            OldStatus = oldStatus,
            NewStatus = nextStatus,
            Description = $"Trạng thái thiết bị tự động cập nhật từ {oldStatus} sang {nextStatus}.",
            CreatedByUserId = _currentUserService.GetUserId(),
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<PagedResult<DeviceHistoryDto>> GetHistoryAsync(Guid deviceId, int page, int pageSize)
    {
        var device = await _repository.GetByIdAsync(deviceId)
            ?? throw new NotFoundException("Device not found.");

        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetRequiredUserId();

        if (!isAdmin)
        {
            var hasAccess = await _deviceAssignmentRepository.HasUserAssignmentForDeviceAsync(deviceId, currentUserId);
            if (!hasAccess)
            {
                throw new ForbiddenException("You are not allowed to view the history for this device.");
            }
        }

        var result = await _deviceHistoryRepository.GetPagedByDeviceIdAsync(deviceId, page, pageSize);

        return new PagedResult<DeviceHistoryDto>
        {
            Items = result.Items.Select(x => new DeviceHistoryDto(
                x.Id,
                x.DeviceId,
                x.Action,
                x.OldStatus,
                x.NewStatus,
                x.Description,
                x.CreatedByUserId,
                x.CreatedByUser != null ? x.CreatedByUser.FullName : null,
                x.CreatedAt,
                x.Device != null ? $"{x.Device.Code} - {x.Device.Name}" : null
            )).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalItems = result.TotalItems
        };
    }

    public async Task<PagedResult<DeviceHistoryDto>> GetAllHistoryAsync(Guid? deviceId, int page, int pageSize)
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetRequiredUserId();

        List<Guid>? allowedDeviceIds = null;
        if (!isAdmin)
        {
            allowedDeviceIds = await _deviceAssignmentRepository.GetDistinctDeviceIdsByUserIdAsync(currentUserId);
        }

        var result = await _deviceHistoryRepository.GetAllPagedAsync(deviceId, allowedDeviceIds, page, pageSize);

        return new PagedResult<DeviceHistoryDto>
        {
            Items = result.Items.Select(x => new DeviceHistoryDto(
                x.Id,
                x.DeviceId,
                x.Action,
                x.OldStatus,
                x.NewStatus,
                x.Description,
                x.CreatedByUserId,
                x.CreatedByUser != null ? x.CreatedByUser.FullName : null,
                x.CreatedAt,
                x.Device != null ? $"{x.Device.Code} - {x.Device.Name}" : null
            )).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalItems = result.TotalItems
        };
    }

    private async Task<DeviceStatus> DetermineStatusAsync(Guid deviceId, DeviceStatus currentStatus)
    {
        if (currentStatus == DeviceStatus.Disposed)
        {
            return DeviceStatus.Disposed;
        }

        var hasActiveRepair = await _repairOrderRepository.HasActiveRepairForDeviceAsync(deviceId);
        if (hasActiveRepair)
        {
            return DeviceStatus.UnderRepair;
        }

        var assignments = await _deviceAssignmentRepository.GetByDeviceIdAsync(deviceId);

        if (assignments.Any(x => x.Status == DeviceAssignmentStatus.Accepted))
        {
            return DeviceStatus.InUse;
        }

        if (assignments.Any(x => x.Status == DeviceAssignmentStatus.Pending))
        {
            return DeviceStatus.PendingAssignment;
        }

        return DeviceStatus.Available;
    }

    private async Task WriteHistoryAsync(
        Guid deviceId,
        Guid? createdByUserId,
        string action,
        DeviceStatus? oldStatus,
        DeviceStatus? newStatus,
        string description)
    {
        await _deviceHistoryRepository.AddAsync(new DeviceHistory
        {
            Id = Guid.NewGuid(),
            DeviceId = deviceId,
            Action = action,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            Description = description,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();
    }

    private static DeviceDto ToDto(Device x) =>
        new(
            x.Id,
            x.Code,
            x.Name,
            x.SerialNumber,
            x.Status,
            x.Category,
            x.Model,
            x.DeviceTypeId,
            x.DeviceType?.Name,
            x.DeviceModelId,
            x.DeviceModel?.Name
        );

    private static DeviceDetailDto ToDetailDto(Device x) =>
        new(
            x.Id,
            x.Code,
            x.Name,
            x.SerialNumber,
            x.Category,
            x.Model,
            x.Status,
            x.PurchasedDate,
            x.CreatedAt,
            x.UpdatedAt,
            x.DeviceTypeId,
            x.DeviceType?.Name,
            x.DeviceModelId,
            x.DeviceModel?.Name
        );
}
