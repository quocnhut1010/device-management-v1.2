using DeviceManagement.Api.DTOs.Devices;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IDeviceService
{
    Task<List<DeviceDto>> GetAsync();
    Task<DeviceDto> CreateAsync(CreateDeviceRequest request);
}
