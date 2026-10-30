using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Users;
using DeviceManagement.Api.Models.Entities;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAsync();
    Task<PagedResult<User>> GetPagedAsync(UserFilterRequest request);
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsByCodeAsync(string code);
    Task<bool> ExistsByEmailAsync(string email);
    Task<bool> HasAssignmentsAsync(Guid id);
    Task<int> GetCountAsync();
    Task AddAsync(User user);
    void Update(User user);
    void Delete(User user);
    Task SaveChangesAsync();
}
