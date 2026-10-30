using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.DeviceTypes;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class DeviceTypeService : IDeviceTypeService
{
    private readonly IDeviceTypeRepository _repository;
    private readonly DeviceManagementDbContext _context;

    public DeviceTypeService(IDeviceTypeRepository repository, DeviceManagementDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<List<DeviceTypeDto>> GetAsync(DeviceTypeFilterRequest? filter = null)
    {
        var types = await _repository.GetAsync(filter);
        return types.Select(ToDto).ToList();
    }

    public async Task<DeviceTypeDto> GetByIdAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Loại thiết bị không tồn tại.");

        return ToDto(item);
    }

    public async Task<DeviceTypeDto> CreateAsync(CreateDeviceTypeRequest request)
    {
        var code = request.Code.Trim();
        if (await _repository.ExistsByCodeAsync(code))
        {
            throw new BusinessException($"Mã loại thiết bị '{code}' đã tồn tại.");
        }

        var item = new DeviceType
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(item);
        await _context.SaveChangesAsync();

        return ToDto(item);
    }

    public async Task<DeviceTypeDto> UpdateAsync(Guid id, UpdateDeviceTypeRequest request)
    {
        var item = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Loại thiết bị không tồn tại.");

        var code = request.Code.Trim();
        if (await _repository.ExistsByCodeAsync(code, id))
        {
            throw new BusinessException($"Mã loại thiết bị '{code}' đã tồn tại ở loại thiết bị khác.");
        }

        item.Code = code;
        item.Name = request.Name.Trim();
        item.Description = request.Description?.Trim();
        item.IsActive = request.IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        _repository.Update(item);
        await _context.SaveChangesAsync();

        return ToDto(item);
    }

    public async Task<DeviceTypeDto> ToggleStatusAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Loại thiết bị không tồn tại.");

        item.IsActive = !item.IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        _repository.Update(item);
        await _context.SaveChangesAsync();

        return ToDto(item);
    }

    public async Task DeleteAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Loại thiết bị không tồn tại.");

        if (await _repository.HasModelsAsync(id))
        {
            throw new BusinessException("Không thể xóa loại thiết bị đang có các dòng máy (Model) trực thuộc. Vui lòng xóa các dòng máy trước hoặc vô hiệu hóa loại thiết bị.");
        }

        if (await _repository.HasDevicesAsync(id))
        {
            throw new BusinessException("Không thể xóa loại thiết bị đang được gắn với các thiết bị vật lý. Vui lòng vô hiệu hóa loại thiết bị.");
        }

        _repository.Delete(item);
        await _context.SaveChangesAsync();
    }

    private static DeviceTypeDto ToDto(DeviceType x) =>
        new(
            x.Id,
            x.Code,
            x.Name,
            x.Description,
            x.IsActive,
            x.DeviceModels?.Count ?? 0,
            x.Devices?.Count ?? 0,
            x.CreatedAt,
            x.UpdatedAt
        );
}
