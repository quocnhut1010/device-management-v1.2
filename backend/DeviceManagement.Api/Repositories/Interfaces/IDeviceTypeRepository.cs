using DeviceManagement.Api.Models.Entities;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IDeviceTypeRepository
{
    Task<List<DeviceType>> GetAsync(string? keyword = null, bool? isActive = null);
    Task<DeviceType?> GetByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null);
    Task<bool> HasModelsAsync(Guid id);
    Task<bool> HasDevicesAsync(Guid id);
    Task AddAsync(DeviceType deviceType);
    void Update(DeviceType deviceType);
    void Delete(DeviceType deviceType);
}
