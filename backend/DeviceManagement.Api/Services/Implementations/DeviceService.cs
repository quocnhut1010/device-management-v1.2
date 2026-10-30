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
    private readonly DeviceManagementDbContext _context;

    public DeviceService(IDeviceRepository repository, DeviceManagementDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<List<DeviceDto>> GetAsync() =>
        (await _repository.GetAsync()).Select(ToDto).ToList();

    public async Task<PagedResult<DeviceDto>> GetAsync(DeviceFilterRequest request)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);

        var query = _context.Devices.AsNoTracking().AsQueryable();

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

        var device = new Device
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            SerialNumber = request.SerialNumber,
            Category = request.Category,
            Model = request.Model,
            PurchasedDate = request.PurchasedDate,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(device);
        await _context.SaveChangesAsync();

        return ToDto(device);
    }

    public async Task<DeviceDto> UpdateAsync(Guid id, UpdateDeviceRequest request)
    {
        var device = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device not found.");

        device.Name = request.Name;
        device.Category = request.Category;
        device.Model = request.Model;
        device.PurchasedDate = request.PurchasedDate;
        device.UpdatedAt = DateTime.UtcNow;

        _repository.Update(device);
        await _context.SaveChangesAsync();

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

        _repository.Delete(device);
        await _context.SaveChangesAsync();
    }

    public async Task RecalculateStatusAsync(Guid id)
    {
        var device = await _context.Devices.FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new NotFoundException("Device not found.");

        var nextStatus = await DetermineStatusAsync(id, device.Status);
        if (device.Status == nextStatus)
        {
            return;
        }

        device.Status = nextStatus;
        device.UpdatedAt = DateTime.UtcNow;
        _repository.Update(device);
        await _context.SaveChangesAsync();
    }

    private async Task<DeviceStatus> DetermineStatusAsync(Guid deviceId, DeviceStatus currentStatus)
    {
        if (currentStatus == DeviceStatus.Disposed)
        {
            return DeviceStatus.Disposed;
        }

        if (currentStatus == DeviceStatus.UnderRepair)
        {
            return DeviceStatus.UnderRepair;
        }

        var assignments = await _context.DeviceAssignments
            .Where(x => x.DeviceId == deviceId)
            .Select(x => x.Status)
            .ToListAsync();

        if (assignments.Contains(DeviceAssignmentStatus.Accepted))
        {
            return DeviceStatus.InUse;
        }

        if (assignments.Contains(DeviceAssignmentStatus.Pending))
        {
            return DeviceStatus.PendingAssignment;
        }

        return DeviceStatus.Available;
    }

    private static DeviceDto ToDto(Device x) =>
        new(x.Id, x.Code, x.Name, x.SerialNumber, x.Status);

    private static DeviceDetailDto ToDetailDto(Device x) =>
        new(x.Id, x.Code, x.Name, x.SerialNumber, x.Category, x.Model, x.Status, x.PurchasedDate, x.CreatedAt, x.UpdatedAt);
}

