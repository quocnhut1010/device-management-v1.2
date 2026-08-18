using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DeviceAssignmentRepository(DeviceManagementDbContext context) : IDeviceAssignmentRepository
{
    public Task<List<DeviceAssignment>> GetAsync() =>
        context.DeviceAssignments
            .Include(x => x.Device)
            .Include(x => x.User)
            .AsNoTracking()
            .ToListAsync();

    public Task<DeviceAssignment?> GetByIdAsync(Guid id) =>
        context.DeviceAssignments
            .Include(x => x.Device)
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> HasDeviceAssignmentAsync(Guid deviceId, params DeviceAssignmentStatus[] statuses) =>
        context.DeviceAssignments.AnyAsync(x => x.DeviceId == deviceId && statuses.Contains(x.Status));

    public async Task AddAsync(DeviceAssignment assignment) => await context.DeviceAssignments.AddAsync(assignment);
    public void Update(DeviceAssignment assignment) => context.DeviceAssignments.Update(assignment);
}
