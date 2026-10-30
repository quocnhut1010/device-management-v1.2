using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Users;

public record UserDto(
    Guid Id,
    string Code,
    string FullName,
    string Email,
    UserStatus Status,
    Guid? DepartmentId = null,
    string? DepartmentName = null,
    string? Role = null);
