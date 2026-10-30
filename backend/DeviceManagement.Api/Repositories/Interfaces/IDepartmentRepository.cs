using DeviceManagement.Api.Models.Entities;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IDepartmentRepository
{
    Task<List<Department>> GetAsync(string? keyword = null, bool? isActive = null);
    Task<Department?> GetByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null);
    Task<bool> HasUsersAsync(Guid id);
    Task AddAsync(Department department);
    void Update(Department department);
    void Delete(Department department);
}
