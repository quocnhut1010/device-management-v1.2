namespace DeviceManagement.Api.DTOs.Auth;

public record LoginResponse(string Token, Guid UserId, string Email, string Role, string FullName);
