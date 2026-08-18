using DeviceManagement.Api.Data;
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

    public Task<List<DeviceAssignment>> GetAsync() =>
        _context.DeviceAssignments
            .Include(x => x.Device)
            .Include(x => x.User)
            .AsNoTracking()
            .ToListAsync();

    public Task<DeviceAssignment?> GetByIdAsync(Guid id) =>
        _context.DeviceAssignments
            .Include(x => x.Device)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> HasDeviceAssignmentAsync(Guid deviceId, params DeviceAssignmentStatus[] statuses) =>
        _context.DeviceAssignments.AnyAsync(x => x.DeviceId == deviceId && statuses.Contains(x.Status));

    public async Task AddAsync(DeviceAssignment assignment) => await _context.DeviceAssignments.AddAsync(assignment);
    public void Update(DeviceAssignment assignment) => _context.DeviceAssignments.Update(assignment);
}
