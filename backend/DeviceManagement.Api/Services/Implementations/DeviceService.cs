using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Devices;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Services.Implementations;

public class DeviceService : IDeviceService
{
    private readonly IDeviceRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly DeviceManagementDbContext _context;

    public DeviceService(
        IDeviceRepository repository,
        ICurrentUserService currentUserService,
        DeviceManagementDbContext context)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<List<DeviceDto>> GetAsync() =>
        (await _repository.GetAsync()).Select(ToDto).ToList();

    public async Task<PagedResult<DeviceDto>> GetAsync(DeviceFilterRequest request)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);

        var query = _context.Devices
            .Include(x => x.DeviceType)
            .Include(x => x.DeviceModel)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim();
            query = query.Where(x => x.Code.Contains(keyword) || x.Name.Contains(keyword) || x.SerialNumber.Contains(keyword));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToDto(x))
            .ToListAsync();

        return new PagedResult<DeviceDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
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
            deviceType = await _context.DeviceTypes.FirstOrDefaultAsync(x => x.Id == request.DeviceTypeId.Value)
                ?? throw new NotFoundException("Loại thiết bị không tồn tại.");

            if (!deviceType.IsActive)
            {
                throw new BusinessException("Loại thiết bị đã bị vô hiệu hóa hoặc không hợp lệ.");
            }
        }

        if (request.DeviceModelId.HasValue)
        {
            deviceModel = await _context.DeviceModels.Include(m => m.DeviceType).FirstOrDefaultAsync(x => x.Id == request.DeviceModelId.Value)
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

        var categoryName = deviceType?.Name ?? request.Category;
        var modelName = deviceModel?.Name ?? request.Model;

        var device = new Device
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            SerialNumber = request.SerialNumber,
            DeviceTypeId = deviceType?.Id,
            DeviceModelId = deviceModel?.Id,
            Category = categoryName,
            Model = modelName,
            PurchasedDate = request.PurchasedDate,
            CreatedAt = DateTime.UtcNow
        };

        await using var transaction = await _context.Database.BeginTransactionAsync();

        await _repository.AddAsync(device);
        await _context.SaveChangesAsync();

        await WriteHistoryAsync(
            device.Id,
            _currentUserService.GetUserId(),
            "DeviceCreated",
            null,
            DeviceStatus.Available,
            $"Thiết bị '{device.Name}' ({device.Code}) được khởi tạo trên hệ thống.");

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
            deviceType = await _context.DeviceTypes.FirstOrDefaultAsync(x => x.Id == request.DeviceTypeId.Value)
                ?? throw new NotFoundException("Loại thiết bị không tồn tại.");

            if (!deviceType.IsActive)
            {
                throw new BusinessException("Loại thiết bị đã bị vô hiệu hóa hoặc không hợp lệ.");
            }
        }

        if (request.DeviceModelId.HasValue)
        {
            deviceModel = await _context.DeviceModels.Include(m => m.DeviceType).FirstOrDefaultAsync(x => x.Id == request.DeviceModelId.Value)
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

        await using var transaction = await _context.Database.BeginTransactionAsync();

        _repository.Update(device);
        await _context.SaveChangesAsync();

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

        var histories = await _context.DeviceHistories.Where(x => x.DeviceId == id).ToListAsync();
        if (histories.Count > 0)
        {
            _context.DeviceHistories.RemoveRange(histories);
        }

        _repository.Delete(device);
        await _context.SaveChangesAsync();
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
        await _context.SaveChangesAsync();

        await WriteHistoryAsync(
            device.Id,
            _currentUserService.GetUserId(),
            "StatusRecalculated",
            oldStatus,
            nextStatus,
            $"Trạng thái thiết bị tự động cập nhật từ {oldStatus} sang {nextStatus}.");
    }

    public async Task<PagedResult<DeviceHistoryDto>> GetHistoryAsync(Guid deviceId, int page, int pageSize)
    {
        var device = await _repository.GetByIdAsync(deviceId)
            ?? throw new NotFoundException("Device not found.");

        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetRequiredUserId();

        if (!isAdmin)
        {
            var hasAccess = await _context.DeviceAssignments
                .AnyAsync(a => a.DeviceId == deviceId && a.UserId == currentUserId);

            if (!hasAccess)
            {
                throw new ForbiddenException("You are not allowed to view the history for this device.");
            }
        }

        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.DeviceHistories
            .AsNoTracking()
            .Include(x => x.CreatedByUser)
            .Include(x => x.Device)
            .Where(x => x.DeviceId == deviceId)
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new DeviceHistoryDto(
                x.Id,
                x.DeviceId,
                x.Action,
                x.OldStatus,
                x.NewStatus,
                x.Description,
                x.CreatedByUserId,
                x.CreatedByUser != null ? x.CreatedByUser.FullName : null,
                x.CreatedAt,
                x.Device != null ? $"{x.Device.Code} - {x.Device.Name}" : null))
            .ToListAsync();

        return new PagedResult<DeviceHistoryDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public async Task<PagedResult<DeviceHistoryDto>> GetAllHistoryAsync(Guid? deviceId, int page, int pageSize)
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetRequiredUserId();

        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.DeviceHistories
            .AsNoTracking()
            .Include(x => x.CreatedByUser)
            .Include(x => x.Device)
            .AsQueryable();

        if (!isAdmin)
        {
            var allowedDeviceIds = await _context.DeviceAssignments
                .Where(a => a.UserId == currentUserId)
                .Select(a => a.DeviceId)
                .Distinct()
                .ToListAsync();

            query = query.Where(x => allowedDeviceIds.Contains(x.DeviceId));
        }

        if (deviceId.HasValue)
        {
            query = query.Where(x => x.DeviceId == deviceId.Value);
        }

        query = query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new DeviceHistoryDto(
                x.Id,
                x.DeviceId,
                x.Action,
                x.OldStatus,
                x.NewStatus,
                x.Description,
                x.CreatedByUserId,
                x.CreatedByUser != null ? x.CreatedByUser.FullName : null,
                x.CreatedAt,
                x.Device != null ? $"{x.Device.Code} - {x.Device.Name}" : null))
            .ToListAsync();

        return new PagedResult<DeviceHistoryDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    private async Task<DeviceStatus> DetermineStatusAsync(Guid deviceId, DeviceStatus currentStatus)
    {
        var assignments = await _context.DeviceAssignments
            .Where(x => x.DeviceId == deviceId)
            .OrderByDescending(x => x.AssignedAt)
            .ToListAsync();

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
        await _context.DeviceHistories.AddAsync(new DeviceHistory
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

        await _context.SaveChangesAsync();
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
