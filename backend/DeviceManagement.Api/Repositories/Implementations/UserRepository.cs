using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly DeviceManagementDbContext _context;

    public UserRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public Task<List<User>> GetAsync() =>
        _context.Users.AsNoTracking().OrderBy(x => x.Code).ToListAsync();

    public Task<User?> GetByIdAsync(Guid id) =>
        _context.Users.FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> ExistsByCodeAsync(string code) =>
        _context.Users.AnyAsync(x => x.Code == code);

    public Task<bool> ExistsByEmailAsync(string email) =>
        _context.Users.AnyAsync(x => x.Email == email);

    public Task<bool> HasAssignmentsAsync(Guid id) =>
        _context.DeviceAssignments.AnyAsync(x => x.UserId == id || x.AssignedByUserId == id);

    public async Task AddAsync(User user) =>
        await _context.Users.AddAsync(user);

    public void Update(User user) =>
        _context.Users.Update(user);

    public void Delete(User user) =>
        _context.Users.Remove(user);
}

