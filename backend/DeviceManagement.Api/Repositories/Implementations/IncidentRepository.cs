using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class IncidentRepository : IIncidentRepository
{
    private readonly DeviceManagementDbContext _context;

    public IncidentRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<Incident>> GetPagedAsync(
        string? keyword,
        Guid? deviceId,
        Guid? reportedByUserId,
        IncidentStatus? status,
        IncidentSeverity? severity,
        int page,
        int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);

        var query = _context.Incidents
            .Include(x => x.Device)
            .Include(x => x.ReportedByUser)
            .Include(x => x.RepairOrders)
            .AsNoTracking()
            .AsQueryable();

        if (reportedByUserId.HasValue)
        {
            query = query.Where(x => x.ReportedByUserId == reportedByUserId.Value);
        }

        if (deviceId.HasValue)
        {
            query = query.Where(x => x.DeviceId == deviceId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        if (severity.HasValue)
        {
            query = query.Where(x => x.Severity == severity.Value);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim();
            query = query.Where(x => x.Title.Contains(kw) || x.Description.Contains(kw) || x.Device.Code.Contains(kw) || x.Device.Name.Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.ReportedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Incident>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public Task<Incident?> GetByIdAsync(Guid id) =>
        _context.Incidents
            .Include(x => x.Device)
            .Include(x => x.ReportedByUser)
            .Include(x => x.RepairOrders)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<int> GetCountAsync(IncidentStatus? status = null, Guid? reportedByUserId = null)
    {
        var query = _context.Incidents.AsQueryable();
        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }
        if (reportedByUserId.HasValue)
        {
            query = query.Where(x => x.ReportedByUserId == reportedByUserId.Value);
        }
        return query.CountAsync();
    }

    public async Task AddAsync(Incident incident) =>
        await _context.Incidents.AddAsync(incident);

    public void Update(Incident incident) =>
        _context.Incidents.Update(incident);

    public void Delete(Incident incident) =>
        _context.Incidents.Remove(incident);
}
