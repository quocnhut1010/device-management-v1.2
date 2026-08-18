using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DeviceRepository(DeviceManagementDbContext context) : IDeviceRepository
{
    public Task<List<Device>> GetAsync() => context.Devices.AsNoTracking().ToListAsync();
    public Task<Device?> GetByIdAsync(Guid id) => context.Devices.FirstOrDefaultAsync(x => x.Id == id);
    public Task<bool> ExistsByCodeAsync(string code) => context.Devices.AnyAsync(x => x.Code == code);
    public async Task AddAsync(Device device) => await context.Devices.AddAsync(device);
    public void Update(Device device) => context.Devices.Update(device);
}
