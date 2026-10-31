using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IRepairOrderRepository
{
    Task<PagedResult<RepairOrder>> GetPagedAsync(
        string? keyword,
        Guid? deviceId,
        Guid? assignedToUserId,
        RepairStatus? status,
        RepairPriority? priority,
        int page,
        int pageSize);

    Task<RepairOrder?> GetByIdAsync(Guid id);
    Task<RepairOrder?> GetByCodeAsync(string code);
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null);
    Task<int> GetCountAsync(RepairStatus? status = null, Guid? assignedToUserId = null);
    Task<bool> HasActiveRepairForDeviceAsync(Guid deviceId, Guid? excludeRepairOrderId = null);
    Task AddAsync(RepairOrder repairOrder);
    void Update(RepairOrder repairOrder);
    void Delete(RepairOrder repairOrder);
}
