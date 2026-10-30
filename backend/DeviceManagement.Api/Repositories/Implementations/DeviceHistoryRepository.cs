using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DeviceHistoryRepository : IDeviceHistoryRepository
{
    private readonly DeviceManagementDbContext _context;

    public DeviceHistoryRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(DeviceHistory history) =>
        await _context.DeviceHistories.AddAsync(history);

    public async Task DeleteByDeviceIdAsync(Guid deviceId)
    {
        var histories = await _context.DeviceHistories
            .Where(h => h.DeviceId == deviceId)
            .ToListAsync();

        if (histories.Count > 0)
        {
            _context.DeviceHistories.RemoveRange(histories);
        }
    }

    public async Task<PagedResult<DeviceHistory>> GetPagedByDeviceIdAsync(Guid deviceId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.DeviceHistories
            .AsNoTracking()
            .Include(x => x.CreatedByUser)
            .Include(x => x.Device)
            .Where(x => x.DeviceId == deviceId)
            .OrderByDescending(x => x.CreatedAt)
            .ThenByDescending(x => x.Id);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<DeviceHistory>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public async Task<PagedResult<DeviceHistory>> GetAllPagedAsync(Guid? deviceId, List<Guid>? allowedDeviceIds, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.DeviceHistories
            .AsNoTracking()
            .Include(x => x.CreatedByUser)
            .Include(x => x.Device)
            .AsQueryable();

        if (allowedDeviceIds != null)
        {
            query = query.Where(x => allowedDeviceIds.Contains(x.DeviceId));
        }

        if (deviceId.HasValue)
        {
            query = query.Where(x => x.DeviceId == deviceId.Value);
        }

        query = query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<DeviceHistory>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }
}
