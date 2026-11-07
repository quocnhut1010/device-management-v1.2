using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAsync();
    Task<PagedResult<User>> GetPagedAsync(string? keyword, UserStatus? status, int page, int pageSize);
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsByCodeAsync(string code);
    Task<bool> ExistsByEmailAsync(string email, Guid? excludeUserId = null);
    Task<bool> HasAssignmentsAsync(Guid id);
    Task<bool> HasIncidentsAsync(Guid id);
    Task<bool> HasRepairOrdersAsync(Guid id);
    Task<bool> HasDeviceHistoriesAsync(Guid id);
    Task<int> GetCountAsync();
    Task AddAsync(User user);
    void Update(User user);
    void Delete(User user);
}
