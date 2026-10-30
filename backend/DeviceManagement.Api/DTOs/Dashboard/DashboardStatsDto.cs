namespace DeviceManagement.Api.DTOs.Dashboard;

public record DashboardStatsDto(
    int TotalDevices,
    int AvailableDevices,
    int InUseDevices,
    int PendingDevices,
    int UnderRepairDevices,
    int DisposedDevices,
    int TotalUsers,
    int PendingAssignments,
    int MyAssignments);
