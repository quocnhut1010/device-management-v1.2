using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Departments;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly DeviceManagementDbContext _context;

    public DepartmentRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public Task<List<Department>> GetAsync(DepartmentFilterRequest? filter = null)
    {
        var query = _context.Departments
            .Include(x => x.Users)
            .AsNoTracking()
            .AsQueryable();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                var kw = filter.Keyword.Trim();
                query = query.Where(x => x.Code.Contains(kw) || x.Name.Contains(kw));
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(x => x.IsActive == filter.IsActive.Value);
            }
        }

        return query.OrderBy(x => x.Code).ToListAsync();
    }

    public Task<Department?> GetByIdAsync(Guid id) =>
        _context.Departments.Include(x => x.Users).FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null) =>
        _context.Departments.AnyAsync(x => x.Code == code && (!excludeId.HasValue || x.Id != excludeId.Value));

    public Task<bool> HasUsersAsync(Guid id) =>
        _context.Users.AnyAsync(x => x.DepartmentId == id);

    public async Task AddAsync(Department department) =>
        await _context.Departments.AddAsync(department);

    public void Update(Department department) =>
        _context.Departments.Update(department);

    public void Delete(Department department) =>
        _context.Departments.Remove(department);
}
