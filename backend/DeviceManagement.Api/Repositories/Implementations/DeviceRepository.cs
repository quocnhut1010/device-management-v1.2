using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DeviceRepository : IDeviceRepository
{
    private readonly DeviceManagementDbContext _context;

    public DeviceRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public Task<List<Device>> GetAsync() =>
        _context.Devices
            .Include(x => x.DeviceType)
            .Include(x => x.DeviceModel)
            .AsNoTracking()
            .OrderBy(x => x.Code)
            .ToListAsync();

    public async Task<PagedResult<Device>> GetPagedAsync(string? keyword, DeviceStatus? status, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.Devices
            .Include(x => x.DeviceType)
            .Include(x => x.DeviceModel)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim();
            query = query.Where(x => x.Code.Contains(kw) || x.Name.Contains(kw) || x.SerialNumber.Contains(kw));
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

        return new PagedResult<Device>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public Task<Device?> GetByIdAsync(Guid id) =>
        _context.Devices
            .Include(x => x.DeviceType)
            .Include(x => x.DeviceModel)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null) =>
        _context.Devices.AnyAsync(x => x.Code == code && (!excludeId.HasValue || x.Id != excludeId.Value));

    public Task<bool> ExistsBySerialNumberAsync(string serialNumber, Guid? excludeId = null) =>
        _context.Devices.AnyAsync(x => x.SerialNumber == serialNumber && (!excludeId.HasValue || x.Id != excludeId.Value));

    public Task<bool> HasAssignmentsAsync(Guid id) =>
        _context.DeviceAssignments.AnyAsync(x => x.DeviceId == id);

    public Task<int> GetCountAsync() =>
        _context.Devices.CountAsync();

    public Task<int> GetCountByStatusAsync(DeviceStatus status) =>
        _context.Devices.CountAsync(d => d.Status == status);

    public async Task AddAsync(Device device) =>
        await _context.Devices.AddAsync(device);

    public void Update(Device device) =>
        _context.Devices.Update(device);

    public void Delete(Device device) =>
        _context.Devices.Remove(device);
}
