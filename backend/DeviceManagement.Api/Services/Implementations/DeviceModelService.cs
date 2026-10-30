using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.DeviceModels;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Services.Implementations;

public class DeviceModelService : IDeviceModelService
{
    private readonly IDeviceModelRepository _repository;
    private readonly IDeviceTypeRepository _deviceTypeRepository;
    private readonly DeviceManagementDbContext _context;

    public DeviceModelService(
        IDeviceModelRepository repository,
        IDeviceTypeRepository deviceTypeRepository,
        DeviceManagementDbContext context)
    {
        _repository = repository;
        _deviceTypeRepository = deviceTypeRepository;
        _context = context;
    }

    public async Task<List<DeviceModelDto>> GetAsync(DeviceModelFilterRequest? filter = null)
    {
        var models = await _repository.GetAsync(filter);
        return models.Select(ToDto).ToList();
    }

    public async Task<DeviceModelDto> GetByIdAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Dòng máy (Model) không tồn tại.");

        return ToDto(item);
    }

    public async Task<DeviceModelDto> CreateAsync(CreateDeviceModelRequest request)
    {
        var deviceType = await _deviceTypeRepository.GetByIdAsync(request.DeviceTypeId)
            ?? throw new NotFoundException("Loại thiết bị được chỉ định không tồn tại.");

        if (!deviceType.IsActive)
        {
            throw new BusinessException("Không thể tạo dòng máy cho loại thiết bị đã bị vô hiệu hóa.");
        }

        var code = request.Code.Trim();
        if (await _repository.ExistsByCodeAsync(code))
        {
            throw new BusinessException($"Mã dòng máy '{code}' đã tồn tại.");
        }

        var item = new DeviceModel
        {
            Id = Guid.NewGuid(),
            DeviceTypeId = request.DeviceTypeId,
            Code = code,
            Name = request.Name.Trim(),
            Manufacturer = request.Manufacturer?.Trim(),
            Specifications = request.Specifications?.Trim(),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(item);
        await _context.SaveChangesAsync();

        item.DeviceType = deviceType;
        return ToDto(item);
    }

    public async Task<DeviceModelDto> UpdateAsync(Guid id, UpdateDeviceModelRequest request)
    {
        var item = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Dòng máy (Model) không tồn tại.");

        var deviceType = await _deviceTypeRepository.GetByIdAsync(request.DeviceTypeId)
            ?? throw new NotFoundException("Loại thiết bị được chỉ định không tồn tại.");

        if (!deviceType.IsActive && item.DeviceTypeId != request.DeviceTypeId)
        {
            throw new BusinessException("Không thể chuyển dòng máy sang loại thiết bị đã bị vô hiệu hóa.");
        }

        var code = request.Code.Trim();
        if (await _repository.ExistsByCodeAsync(code, id))
        {
            throw new BusinessException($"Mã dòng máy '{code}' đã tồn tại ở dòng máy khác.");
        }

        item.DeviceTypeId = request.DeviceTypeId;
        item.Code = code;
        item.Name = request.Name.Trim();
        item.Manufacturer = request.Manufacturer?.Trim();
        item.Specifications = request.Specifications?.Trim();
        item.IsActive = request.IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        _repository.Update(item);
        await _context.SaveChangesAsync();

        item.DeviceType = deviceType;
        return ToDto(item);
    }

    public async Task<DeviceModelDto> ToggleStatusAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Dòng máy (Model) không tồn tại.");

        item.IsActive = !item.IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        _repository.Update(item);
        await _context.SaveChangesAsync();

        return ToDto(item);
    }

    public async Task DeleteAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Dòng máy (Model) không tồn tại.");

        if (await _repository.HasDevicesAsync(id))
        {
            throw new BusinessException("Không thể xóa dòng máy đang được gắn với các thiết bị vật lý. Vui lòng vô hiệu hóa dòng máy.");
        }

        _repository.Delete(item);
        await _context.SaveChangesAsync();
    }

    private static DeviceModelDto ToDto(DeviceModel x) =>
        new(
            x.Id,
            x.DeviceTypeId,
            x.DeviceType?.Name,
            x.Code,
            x.Name,
            x.Manufacturer,
            x.Specifications,
            x.IsActive,
            x.Devices?.Count ?? 0,
            x.CreatedAt,
            x.UpdatedAt
        );
}
