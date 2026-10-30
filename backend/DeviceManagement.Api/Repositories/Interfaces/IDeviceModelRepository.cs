using DeviceManagement.Api.DTOs.DeviceModels;
using DeviceManagement.Api.Models.Entities;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IDeviceModelRepository
{
    Task<List<DeviceModel>> GetAsync(DeviceModelFilterRequest? filter = null);
    Task<DeviceModel?> GetByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null);
    Task<bool> HasDevicesAsync(Guid id);
    Task AddAsync(DeviceModel deviceModel);
    void Update(DeviceModel deviceModel);
    void Delete(DeviceModel deviceModel);
}
