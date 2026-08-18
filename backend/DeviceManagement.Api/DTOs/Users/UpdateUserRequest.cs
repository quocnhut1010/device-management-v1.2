using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Users;

public record UpdateUserRequest(
    Guid? DepartmentId,
    string FullName,
    string Email,
    string? PhoneNumber,
    UserStatus Status);

