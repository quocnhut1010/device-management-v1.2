using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IDeviceAssignmentRepository
{
    Task<List<DeviceAssignment>> GetAsync();
    Task<DeviceAssignment?> GetByIdAsync(Guid id);
    Task<bool> HasDeviceAssignmentAsync(Guid deviceId, params DeviceAssignmentStatus[] statuses);
    Task AddAsync(DeviceAssignment assignment);
    void Update(DeviceAssignment assignment);
}
