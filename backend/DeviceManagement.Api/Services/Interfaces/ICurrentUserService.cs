namespace DeviceManagement.Api.Services.Interfaces;

public interface ICurrentUserService
{
    Guid GetRequiredUserId();
    string? GetCurrentRole();
    bool IsInRole(params string[] roles);
}
