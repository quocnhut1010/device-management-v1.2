namespace DeviceManagement.Api.DTOs.Departments;

public record DepartmentDto(
    Guid Id,
    string Code,
    string Name,
    bool IsActive,
    int UserCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateDepartmentRequest(
    string Code,
    string Name,
    bool IsActive = true);

public record UpdateDepartmentRequest(
    string Code,
    string Name,
    bool IsActive);

public record DepartmentFilterRequest(
    string? Keyword,
    bool? IsActive);
