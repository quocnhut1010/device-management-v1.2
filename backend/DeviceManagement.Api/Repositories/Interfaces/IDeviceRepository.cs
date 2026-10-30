using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IDeviceRepository
{
    Task<List<Device>> GetAsync();
    Task<PagedResult<Device>> GetPagedAsync(string? keyword, DeviceStatus? status, int page, int pageSize);
    Task<Device?> GetByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null);
    Task<bool> ExistsBySerialNumberAsync(string serialNumber, Guid? excludeId = null);
    Task<bool> HasAssignmentsAsync(Guid id);
    Task<int> GetCountAsync();
    Task<int> GetCountByStatusAsync(DeviceStatus status);
    Task AddAsync(Device device);
    void Update(Device device);
    void Delete(Device device);
}
