using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class UserRepository(DeviceManagementDbContext context) : IUserRepository
{
    public Task<List<User>> GetAsync() =>
        context.Users.AsNoTracking().OrderBy(x => x.Code).ToListAsync();

    public Task<User?> GetByIdAsync(Guid id) =>
        context.Users.FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> ExistsByCodeAsync(string code) =>
        context.Users.AnyAsync(x => x.Code == code);

    public Task<bool> ExistsByEmailAsync(string email) =>
        context.Users.AnyAsync(x => x.Email == email);

    public Task<bool> HasAssignmentsAsync(Guid id) =>
        context.DeviceAssignments.AnyAsync(x => x.UserId == id || x.AssignedByUserId == id);

    public async Task AddAsync(User user) =>
        await context.Users.AddAsync(user);

    public void Update(User user) =>
        context.Users.Update(user);

    public void Delete(User user) =>
        context.Users.Remove(user);
}

