using DeviceManagement.Api.Models.Entities;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAsync();
    Task<User?> GetByIdAsync(Guid id);
    Task<bool> ExistsByCodeAsync(string code);
    Task<bool> ExistsByEmailAsync(string email);
    Task<bool> HasAssignmentsAsync(Guid id);
    Task AddAsync(User user);
    void Update(User user);
    void Delete(User user);
}

