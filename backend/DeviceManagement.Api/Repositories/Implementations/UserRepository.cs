using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class UserRepository(DeviceManagementDbContext context) : IUserRepository
{
    public Task<List<User>> GetAsync() => context.Users.AsNoTracking().ToListAsync();
    public Task<User?> GetByIdAsync(Guid id) => context.Users.FirstOrDefaultAsync(x => x.Id == id);
    public Task<bool> ExistsByCodeAsync(string code) => context.Users.AnyAsync(x => x.Code == code);
    public async Task AddAsync(User user) => await context.Users.AddAsync(user);
}
