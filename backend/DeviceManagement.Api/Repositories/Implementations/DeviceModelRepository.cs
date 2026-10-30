using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.DeviceModels;
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

    public Task<List<DeviceModel>> GetAsync(DeviceModelFilterRequest? filter = null)
    {
        var query = _context.DeviceModels
            .Include(x => x.DeviceType)
            .Include(x => x.Devices)
            .AsNoTracking()
            .AsQueryable();

        if (filter != null)
        {
            if (filter.DeviceTypeId.HasValue)
            {
                query = query.Where(x => x.DeviceTypeId == filter.DeviceTypeId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                var kw = filter.Keyword.Trim();
                query = query.Where(x => x.Code.Contains(kw) || x.Name.Contains(kw) || (x.Manufacturer != null && x.Manufacturer.Contains(kw)));
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(x => x.IsActive == filter.IsActive.Value);
            }
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

    public Task SaveChangesAsync() =>
        _context.SaveChangesAsync();
}
