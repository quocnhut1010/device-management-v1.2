using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.DTOs.Departments;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DepartmentService(IDepartmentRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<DepartmentDto>> GetAsync(DepartmentFilterRequest? filter = null)
    {
        var departments = await _repository.GetAsync(filter?.Keyword, filter?.IsActive);
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
        await _unitOfWork.SaveChangesAsync();

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
        await _unitOfWork.SaveChangesAsync();

        return ToDto(department);
    }

    public async Task<DepartmentDto> ToggleStatusAsync(Guid id)
    {
        var department = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("Phòng ban không tồn tại.");

        department.IsActive = !department.IsActive;
        department.UpdatedAt = DateTime.UtcNow;

        _repository.Update(department);
        await _unitOfWork.SaveChangesAsync();

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
        await _unitOfWork.SaveChangesAsync();
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
