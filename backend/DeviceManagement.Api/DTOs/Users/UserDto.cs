using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Users;

public record UserDto(Guid Id, string Code, string FullName, string Email, UserStatus Status);
