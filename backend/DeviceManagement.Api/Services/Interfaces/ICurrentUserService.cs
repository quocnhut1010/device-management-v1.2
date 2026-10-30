namespace DeviceManagement.Api.Services.Interfaces;

public interface ICurrentUserService
{
    Guid? GetUserId();
    Guid GetRequiredUserId();
    string? GetCurrentRole();
    bool IsInRole(params string[] roles);
}
