using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Users;

public record UserDetailDto(
    Guid Id,
    Guid? DepartmentId,
    string Code,
    string FullName,
    string Email,
    string? PhoneNumber,
    UserStatus Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

