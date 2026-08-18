using DeviceManagement.Api.DTOs.Devices;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IDeviceService
{
    Task<List<DeviceDto>> GetAsync();
    Task<DeviceDetailDto> GetByIdAsync(Guid id);
    Task<DeviceDto> CreateAsync(CreateDeviceRequest request);
    Task<DeviceDto> UpdateAsync(Guid id, UpdateDeviceRequest request);
    Task DeleteAsync(Guid id);
}

