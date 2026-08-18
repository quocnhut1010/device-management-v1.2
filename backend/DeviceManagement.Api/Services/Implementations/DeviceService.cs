using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Devices;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class DeviceService(IDeviceRepository repository, DeviceManagementDbContext context) : IDeviceService
{
    public async Task<List<DeviceDto>> GetAsync() => (await repository.GetAsync()).Select(ToDto).ToList();

    public async Task<DeviceDto> CreateAsync(CreateDeviceRequest request)
    {
        if (await repository.ExistsByCodeAsync(request.Code))
        {
            throw new BusinessException("Device code already exists.");
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

    private static DeviceDto ToDto(Device x) => new(x.Id, x.Code, x.Name, x.SerialNumber, x.Status);
}
