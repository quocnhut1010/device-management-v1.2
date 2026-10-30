using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.DeviceAssignments;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DeviceAssignmentRepository : IDeviceAssignmentRepository
{
    private readonly DeviceManagementDbContext _context;

    public DeviceAssignmentRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public Task<List<DeviceAssignment>> GetAsync(Guid? userId = null)
    {
        var query = _context.DeviceAssignments
            .Include(x => x.Device)
            .Include(x => x.User)
            .AsNoTracking();

        if (userId.HasValue)
        {
            query = query.Where(x => x.UserId == userId.Value);
        }

        return query.OrderByDescending(x => x.AssignedAt).ToListAsync();
    }

    public async Task<PagedResult<DeviceAssignment>> GetPagedAsync(
        DeviceAssignmentFilterRequest request,
        Guid? currentUserId,
        bool isAdmin)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);

        var query = _context.DeviceAssignments
            .Include(x => x.Device)
            .Include(x => x.User)
            .AsNoTracking()
            .OrderByDescending(x => x.AssignedAt)
            .AsQueryable();

        if (!isAdmin)
        {
            if (currentUserId.HasValue)
            {
                query = query.Where(x => x.UserId == currentUserId.Value);
            }
        }
        else if (request.UserId.HasValue)
        {
            query = query.Where(x => x.UserId == request.UserId.Value);
        }

        if (request.DeviceId.HasValue)
        {
            query = query.Where(x => x.DeviceId == request.DeviceId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<DeviceAssignment>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }

    public Task<DeviceAssignment?> GetByIdAsync(Guid id) =>
        _context.DeviceAssignments
            .Include(x => x.Device)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> HasDeviceAssignmentAsync(Guid deviceId, params DeviceAssignmentStatus[] statuses) =>
        _context.DeviceAssignments.AnyAsync(x => x.DeviceId == deviceId && statuses.Contains(x.Status));

    public Task<bool> HasOtherAcceptedAssignmentAsync(Guid deviceId, Guid excludeAssignmentId) =>
        _context.DeviceAssignments.AnyAsync(x =>
            x.DeviceId == deviceId &&
            x.Id != excludeAssignmentId &&
            x.Status == DeviceAssignmentStatus.Accepted);

    public Task<DeviceAssignment?> GetActiveAcceptedAssignmentAsync(Guid deviceId) =>
        _context.DeviceAssignments
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.DeviceId == deviceId && x.Status == DeviceAssignmentStatus.Accepted);

    public Task<List<DeviceAssignment>> GetByDeviceIdAsync(Guid deviceId) =>
        _context.DeviceAssignments
            .Where(x => x.DeviceId == deviceId)
            .OrderByDescending(x => x.AssignedAt)
            .ToListAsync();

    public Task<bool> HasUserAssignmentForDeviceAsync(Guid deviceId, Guid userId) =>
        _context.DeviceAssignments.AnyAsync(a => a.DeviceId == deviceId && a.UserId == userId);

    public Task<List<Guid>> GetDistinctDeviceIdsByUserIdAsync(Guid userId) =>
        _context.DeviceAssignments
            .Where(a => a.UserId == userId)
            .Select(a => a.DeviceId)
            .Distinct()
            .ToListAsync();

    public Task<int> GetPendingCountAsync(Guid? userId = null)
    {
        if (userId.HasValue)
        {
            return _context.DeviceAssignments.CountAsync(a => a.UserId == userId.Value && a.Status == DeviceAssignmentStatus.Pending);
        }

        return _context.DeviceAssignments.CountAsync(a => a.Status == DeviceAssignmentStatus.Pending);
    }

    public Task<int> GetUserAssignmentCountAsync(Guid userId) =>
        _context.DeviceAssignments.CountAsync(a => a.UserId == userId);

    public async Task AddAsync(DeviceAssignment assignment) =>
        await _context.DeviceAssignments.AddAsync(assignment);

    public void Update(DeviceAssignment assignment) =>
        _context.DeviceAssignments.Update(assignment);

    public Task SaveChangesAsync() =>
        _context.SaveChangesAsync();
}
