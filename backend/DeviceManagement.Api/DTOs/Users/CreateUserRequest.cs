namespace DeviceManagement.Api.DTOs.Users;

public record CreateUserRequest(Guid? DepartmentId, string Code, string FullName, string Email, string? PhoneNumber);
