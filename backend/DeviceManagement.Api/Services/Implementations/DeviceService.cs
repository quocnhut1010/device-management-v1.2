using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Devices;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class DeviceService(IDeviceRepository repository, DeviceManagementDbContext context) : IDeviceService
{
    public async Task<List<DeviceDto>> GetAsync() =>
        (await repository.GetAsync()).Select(ToDto).ToList();

    public async Task<DeviceDetailDto> GetByIdAsync(Guid id)
    {
        var device = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device not found.");

        return ToDetailDto(device);
    }

    public async Task<DeviceDto> CreateAsync(CreateDeviceRequest request)
    {
        if (await repository.ExistsByCodeAsync(request.Code))
        {
            throw new BusinessException("Device code already exists.");
        }

        if (await repository.ExistsBySerialNumberAsync(request.SerialNumber))
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

        await repository.AddAsync(device);
        await context.SaveChangesAsync();

        return ToDto(device);
    }

    public async Task<DeviceDto> UpdateAsync(Guid id, UpdateDeviceRequest request)
    {
        var device = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device not found.");

        device.Name = request.Name;
        device.Category = request.Category;
        device.Model = request.Model;
        device.PurchasedDate = request.PurchasedDate;
        device.UpdatedAt = DateTime.UtcNow;

        repository.Update(device);
        await context.SaveChangesAsync();

        return ToDto(device);
    }

    public async Task DeleteAsync(Guid id)
    {
        var device = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device not found.");

        if (await repository.HasAssignmentsAsync(id))
        {
            throw new BusinessException("Cannot delete a device that has assignment history.");
        }

        repository.Delete(device);
        await context.SaveChangesAsync();
    }

    private static DeviceDto ToDto(Device x) =>
        new(x.Id, x.Code, x.Name, x.SerialNumber, x.Status);

    private static DeviceDetailDto ToDetailDto(Device x) =>
        new(x.Id, x.Code, x.Name, x.SerialNumber, x.Category, x.Model, x.Status, x.PurchasedDate, x.CreatedAt, x.UpdatedAt);
}

