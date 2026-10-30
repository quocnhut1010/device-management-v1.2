using DeviceManagement.Api.DTOs.Auth;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
