using System.Security.Claims;
using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetRequiredUserId()
    {
        var value = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException("Authenticated user ID is missing.");
        }

        return userId;
    }

    public string? GetCurrentRole() => _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);

    public bool IsInRole(params string[] roles)
    {
        var role = GetCurrentRole();
        if (string.IsNullOrWhiteSpace(role))
        {
            throw new ForbiddenException("Current user role is missing.");
        }

        return roles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }
}
