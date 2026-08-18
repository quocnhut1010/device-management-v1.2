using DeviceManagement.Api.Models.Entities;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IDeviceRepository
{
    Task<List<Device>> GetAsync();
    Task<Device?> GetByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code);
    Task<bool> ExistsBySerialNumberAsync(string serialNumber);
    Task<bool> HasAssignmentsAsync(Guid id);
    Task AddAsync(Device device);
    void Update(Device device);
    void Delete(Device device);
}

