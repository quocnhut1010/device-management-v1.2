using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Models.Entities;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IDeviceHistoryRepository
{
    Task AddAsync(DeviceHistory history);
    Task DeleteByDeviceIdAsync(Guid deviceId);
    Task<PagedResult<DeviceHistory>> GetPagedByDeviceIdAsync(Guid deviceId, int page, int pageSize);
    Task<PagedResult<DeviceHistory>> GetAllPagedAsync(Guid? deviceId, List<Guid>? allowedDeviceIds, int page, int pageSize);
    Task SaveChangesAsync();
}
