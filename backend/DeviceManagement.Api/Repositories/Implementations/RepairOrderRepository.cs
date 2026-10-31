using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class RepairOrderRepository : IRepairOrderRepository
{
    private readonly DeviceManagementDbContext _context;

    public RepairOrderRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<RepairOrder>> GetPagedAsync(
        string? keyword,
        Guid? deviceId,
        Guid? assignedToUserId,
        RepairStatus? status,
        RepairPriority? priority,
        int page,
        int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.RepairOrders
            .Include(x => x.Device)
            .Include(x => x.Incident)
            .Include(x => x.AssignedToUser)
            .AsNoTracking()
            .AsQueryable();

        if (assignedToUserId.HasValue)
        {
            query = query.Where(x => x.AssignedToUserId == assignedToUserId.Value);
        }

        if (deviceId.HasValue)
        {
            query = query.Where(x => x.DeviceId == deviceId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(x => x.Priority == priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim();
            query = query.Where(x => x.Code.Contains(kw) || x.Description.Contains(kw) || x.Device.Code.Contains(kw) || x.Device.Name.Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<RepairOrder>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public Task<RepairOrder?> GetByIdAsync(Guid id) =>
        _context.RepairOrders
            .Include(x => x.Device)
            .Include(x => x.Incident)
            .Include(x => x.AssignedToUser)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<RepairOrder?> GetByCodeAsync(string code) =>
        _context.RepairOrders
            .Include(x => x.Device)
            .Include(x => x.Incident)
            .Include(x => x.AssignedToUser)
            .FirstOrDefaultAsync(x => x.Code == code);

    public Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null) =>
        _context.RepairOrders.AnyAsync(x => x.Code == code && (!excludeId.HasValue || x.Id != excludeId.Value));

    public Task<int> GetCountAsync(RepairStatus? status = null, Guid? assignedToUserId = null)
    {
        var query = _context.RepairOrders.AsQueryable();
        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }
        if (assignedToUserId.HasValue)
        {
            query = query.Where(x => x.AssignedToUserId == assignedToUserId.Value);
        }
        return query.CountAsync();
    }

    public Task<bool> HasActiveRepairForDeviceAsync(Guid deviceId, Guid? excludeRepairOrderId = null) =>
        _context.RepairOrders.AnyAsync(x =>
            x.DeviceId == deviceId &&
            (!excludeRepairOrderId.HasValue || x.Id != excludeRepairOrderId.Value) &&
            (x.Status == RepairStatus.Pending ||
             x.Status == RepairStatus.Assigned ||
             x.Status == RepairStatus.InProgress ||
             x.Status == RepairStatus.PendingParts));

    public async Task AddAsync(RepairOrder repairOrder) =>
        await _context.RepairOrders.AddAsync(repairOrder);

    public void Update(RepairOrder repairOrder) =>
        _context.RepairOrders.Update(repairOrder);

    public void Delete(RepairOrder repairOrder) =>
        _context.RepairOrders.Remove(repairOrder);
}
