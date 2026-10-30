using DeviceManagement.Api.Data;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DeviceModelRepository : IDeviceModelRepository
{
    private readonly DeviceManagementDbContext _context;

    public DeviceModelRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public Task<List<DeviceModel>> GetAsync(string? keyword = null, Guid? deviceTypeId = null, bool? isActive = null)
    {
        var query = _context.DeviceModels
            .Include(x => x.DeviceType)
            .Include(x => x.Devices)
            .AsNoTracking()
            .AsQueryable();

        if (deviceTypeId.HasValue)
        {
            query = query.Where(x => x.DeviceTypeId == deviceTypeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim();
            query = query.Where(x => x.Code.Contains(kw) || x.Name.Contains(kw) || (x.Manufacturer != null && x.Manufacturer.Contains(kw)));
        }

        if (isActive.HasValue)
        {
            query = query.Where(x => x.IsActive == isActive.Value);
        }

        return query.OrderBy(x => x.Name).ToListAsync();
    }

    public Task<DeviceModel?> GetByIdAsync(Guid id) =>
        _context.DeviceModels
            .Include(x => x.DeviceType)
            .Include(x => x.Devices)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null) =>
        _context.DeviceModels.AnyAsync(x => x.Code == code && (!excludeId.HasValue || x.Id != excludeId.Value));

    public Task<bool> HasDevicesAsync(Guid id) =>
        _context.Devices.AnyAsync(x => x.DeviceModelId == id);

    public async Task AddAsync(DeviceModel deviceModel) =>
        await _context.DeviceModels.AddAsync(deviceModel);

    public void Update(DeviceModel deviceModel) =>
        _context.DeviceModels.Update(deviceModel);

    public void Delete(DeviceModel deviceModel) =>
        _context.DeviceModels.Remove(deviceModel);
}
