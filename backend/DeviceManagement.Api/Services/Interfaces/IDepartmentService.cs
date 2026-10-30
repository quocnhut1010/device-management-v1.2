using DeviceManagement.Api.DTOs.Departments;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAsync(DepartmentFilterRequest? filter = null);
    Task<DepartmentDto> GetByIdAsync(Guid id);
    Task<DepartmentDto> CreateAsync(CreateDepartmentRequest request);
    Task<DepartmentDto> UpdateAsync(Guid id, UpdateDepartmentRequest request);
    Task<DepartmentDto> ToggleStatusAsync(Guid id);
    Task DeleteAsync(Guid id);
}
