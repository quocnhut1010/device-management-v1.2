using DeviceManagement.Api.DTOs.DeviceModels;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IDeviceModelService
{
    Task<List<DeviceModelDto>> GetAsync(DeviceModelFilterRequest? filter = null);
    Task<DeviceModelDto> GetByIdAsync(Guid id);
    Task<DeviceModelDto> CreateAsync(CreateDeviceModelRequest request);
    Task<DeviceModelDto> UpdateAsync(Guid id, UpdateDeviceModelRequest request);
    Task<DeviceModelDto> ToggleStatusAsync(Guid id);
    Task DeleteAsync(Guid id);
}
