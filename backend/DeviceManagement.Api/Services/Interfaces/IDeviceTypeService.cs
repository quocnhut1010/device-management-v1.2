using DeviceManagement.Api.DTOs.DeviceTypes;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IDeviceTypeService
{
    Task<List<DeviceTypeDto>> GetAsync(DeviceTypeFilterRequest? filter = null);
    Task<DeviceTypeDto> GetByIdAsync(Guid id);
    Task<DeviceTypeDto> CreateAsync(CreateDeviceTypeRequest request);
    Task<DeviceTypeDto> UpdateAsync(Guid id, UpdateDeviceTypeRequest request);
    Task<DeviceTypeDto> ToggleStatusAsync(Guid id);
    Task DeleteAsync(Guid id);
}
