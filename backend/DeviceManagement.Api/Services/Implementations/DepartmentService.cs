using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Departments;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Services.Implementations;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _repository;
    private readonly DeviceManagementDbContext _context;

    public DepartmentService(IDepartmentRepository repository, DeviceManagementDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<List<DepartmentDto>> GetAsync(DepartmentFilterRequest? filter = null)
    {
        var departments = await _repository.GetAsync(filter);
        return departments.Select(ToDto).ToList();
    }

    public async Task<DepartmentDto> GetByIdAsync(Guid id)
    {
        var dept = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Phòng ban không tồn tại.");

        return ToDto(dept);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentRequest request)
    {
        var code = request.Code.Trim();
        if (await _repository.ExistsByCodeAsync(code))
        {
            throw new BusinessException($"Mã phòng ban '{code}' đã tồn tại.");
        }

        var department = new Department
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = request.Name.Trim(),
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(department);
        await _context.SaveChangesAsync();

        return ToDto(department);
    }

    public async Task<DepartmentDto> UpdateAsync(Guid id, UpdateDepartmentRequest request)
    {
        var department = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Phòng ban không tồn tại.");

        var code = request.Code.Trim();
        if (await _repository.ExistsByCodeAsync(code, id))
        {
            throw new BusinessException($"Mã phòng ban '{code}' đã tồn tại ở phòng ban khác.");
        }

        department.Code = code;
        department.Name = request.Name.Trim();
        department.IsActive = request.IsActive;
        department.UpdatedAt = DateTime.UtcNow;

        _repository.Update(department);
        await _context.SaveChangesAsync();

        return ToDto(department);
    }

    public async Task<DepartmentDto> ToggleStatusAsync(Guid id)
    {
        var department = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Phòng ban không tồn tại.");

        department.IsActive = !department.IsActive;
        department.UpdatedAt = DateTime.UtcNow;

        _repository.Update(department);
        await _context.SaveChangesAsync();

        return ToDto(department);
    }

    public async Task DeleteAsync(Guid id)
    {
        var department = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Phòng ban không tồn tại.");

        if (await _repository.HasUsersAsync(id))
        {
            throw new BusinessException("Không thể xóa phòng ban đang có nhân sự trực thuộc. Vui lòng chuyển nhân sự hoặc vô hiệu hóa phòng ban.");
        }

        _repository.Delete(department);
        await _context.SaveChangesAsync();
    }

    private static DepartmentDto ToDto(Department d) =>
        new(
            d.Id,
            d.Code,
            d.Name,
            d.IsActive,
            d.Users?.Count ?? 0,
            d.CreatedAt,
            d.UpdatedAt
        );
}
