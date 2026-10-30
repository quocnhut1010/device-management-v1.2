using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IDeviceAssignmentRepository
{
    Task<List<DeviceAssignment>> GetAsync(Guid? userId = null);
    Task<PagedResult<DeviceAssignment>> GetPagedAsync(Guid? deviceId, Guid? userId, DeviceAssignmentStatus? status, int page, int pageSize);
    Task<DeviceAssignment?> GetByIdAsync(Guid id);
    Task<bool> HasDeviceAssignmentAsync(Guid deviceId, params DeviceAssignmentStatus[] statuses);
    Task<bool> HasOtherAcceptedAssignmentAsync(Guid deviceId, Guid excludeAssignmentId);
    Task<DeviceAssignment?> GetActiveAcceptedAssignmentAsync(Guid deviceId);
    Task<List<DeviceAssignment>> GetByDeviceIdAsync(Guid deviceId);
    Task<bool> HasUserAssignmentForDeviceAsync(Guid deviceId, Guid userId);
    Task<List<Guid>> GetDistinctDeviceIdsByUserIdAsync(Guid userId);
    Task<int> GetPendingCountAsync(Guid? userId = null);
    Task<int> GetUserAssignmentCountAsync(Guid userId);
    Task AddAsync(DeviceAssignment assignment);
    void Update(DeviceAssignment assignment);
}
