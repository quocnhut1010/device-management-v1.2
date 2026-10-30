using DeviceManagement.Api.DTOs.Dashboard;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
}
