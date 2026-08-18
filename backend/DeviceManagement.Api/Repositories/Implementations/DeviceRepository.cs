using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DeviceRepository(DeviceManagementDbContext context) : IDeviceRepository
{
    public Task<List<Device>> GetAsync() =>
        context.Devices.AsNoTracking().OrderBy(x => x.Code).ToListAsync();

    public Task<Device?> GetByIdAsync(Guid id) =>
        context.Devices.FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> ExistsByCodeAsync(string code) =>
        context.Devices.AnyAsync(x => x.Code == code);

    public Task<bool> ExistsBySerialNumberAsync(string serialNumber) =>
        context.Devices.AnyAsync(x => x.SerialNumber == serialNumber);

    public Task<bool> HasAssignmentsAsync(Guid id) =>
        context.DeviceAssignments.AnyAsync(x => x.DeviceId == id);

    public async Task AddAsync(Device device) =>
        await context.Devices.AddAsync(device);

    public void Update(Device device) =>
        context.Devices.Update(device);

    public void Delete(Device device) =>
        context.Devices.Remove(device);
}

