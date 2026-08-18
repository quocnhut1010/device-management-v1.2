using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
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
        _context.Devices.AsNoTracking().OrderBy(x => x.Code).ToListAsync();

    public Task<Device?> GetByIdAsync(Guid id) =>
        _context.Devices.FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> ExistsByCodeAsync(string code) =>
        _context.Devices.AnyAsync(x => x.Code == code);

    public Task<bool> ExistsBySerialNumberAsync(string serialNumber) =>
        _context.Devices.AnyAsync(x => x.SerialNumber == serialNumber);

    public Task<bool> HasAssignmentsAsync(Guid id) =>
        _context.DeviceAssignments.AnyAsync(x => x.DeviceId == id);

    public async Task AddAsync(Device device) =>
        await _context.Devices.AddAsync(device);

    public void Update(Device device) =>
        _context.Devices.Update(device);

    public void Delete(Device device) =>
        _context.Devices.Remove(device);
}

