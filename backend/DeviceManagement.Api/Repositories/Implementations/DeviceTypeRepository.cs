using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.DeviceTypes;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Repositories.Implementations;

public class DeviceTypeRepository : IDeviceTypeRepository
{
    private readonly DeviceManagementDbContext _context;

    public DeviceTypeRepository(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public Task<List<DeviceType>> GetAsync(DeviceTypeFilterRequest? filter = null)
    {
        var query = _context.DeviceTypes
            .Include(x => x.DeviceModels)
            .Include(x => x.Devices)
            .AsNoTracking()
            .AsQueryable();

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                var kw = filter.Keyword.Trim();
                query = query.Where(x => x.Code.Contains(kw) || x.Name.Contains(kw));
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(x => x.IsActive == filter.IsActive.Value);
            }
        }

        return query.OrderBy(x => x.Name).ToListAsync();
    }

    public Task<DeviceType?> GetByIdAsync(Guid id) =>
        _context.DeviceTypes
            .Include(x => x.DeviceModels)
            .Include(x => x.Devices)
            .FirstOrDefaultAsync(x => x.Id == id);

    public Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null) =>
        _context.DeviceTypes.AnyAsync(x => x.Code == code && (!excludeId.HasValue || x.Id != excludeId.Value));

    public Task<bool> HasModelsAsync(Guid id) =>
        _context.DeviceModels.AnyAsync(x => x.DeviceTypeId == id);

    public Task<bool> HasDevicesAsync(Guid id) =>
        _context.Devices.AnyAsync(x => x.DeviceTypeId == id);

    public async Task AddAsync(DeviceType deviceType) =>
        await _context.DeviceTypes.AddAsync(deviceType);

    public void Update(DeviceType deviceType) =>
        _context.DeviceTypes.Update(deviceType);

    public void Delete(DeviceType deviceType) =>
        _context.DeviceTypes.Remove(deviceType);
}
