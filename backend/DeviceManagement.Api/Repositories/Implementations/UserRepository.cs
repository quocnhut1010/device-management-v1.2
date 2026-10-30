using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
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
        _context.Users
            .Include(x => x.Department)
            .AsNoTracking()
            .OrderBy(x => x.Code)
            .ToListAsync();

    public async Task<PagedResult<User>> GetPagedAsync(string? keyword, UserStatus? status, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.Users
            .Include(x => x.Department)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim();
            query = query.Where(x => x.Code.Contains(kw) || x.FullName.Contains(kw) || x.Email.Contains(kw));
        }

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<User>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public Task<User?> GetByIdAsync(Guid id) =>
        _context.Users
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<User?> GetByEmailAsync(string email) =>
        _context.Users
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x => x.Email == email);

    public Task<bool> ExistsByCodeAsync(string code) =>
        _context.Users.AnyAsync(x => x.Code == code);

    public Task<bool> ExistsByEmailAsync(string email) =>
        _context.Users.AnyAsync(x => x.Email == email);

    public Task<bool> HasAssignmentsAsync(Guid id) =>
        _context.DeviceAssignments.AnyAsync(x => x.UserId == id || x.AssignedByUserId == id);

    public Task<int> GetCountAsync() =>
        _context.Users.CountAsync();

    public async Task AddAsync(User user) =>
        await _context.Users.AddAsync(user);

    public void Update(User user) =>
        _context.Users.Update(user);

    public void Delete(User user) =>
        _context.Users.Remove(user);
}
