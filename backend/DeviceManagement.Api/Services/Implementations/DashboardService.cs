using DeviceManagement.Api.DTOs.Dashboard;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUserRepository _userRepository;
    private readonly IDeviceAssignmentRepository _assignmentRepository;
    private readonly ICurrentUserService _currentUserService;

    public DashboardService(
        IDeviceRepository deviceRepository,
        IUserRepository userRepository,
        IDeviceAssignmentRepository assignmentRepository,
        ICurrentUserService currentUserService)
    {
        _deviceRepository = deviceRepository;
        _userRepository = userRepository;
        _assignmentRepository = assignmentRepository;
        _currentUserService = currentUserService;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var totalDevices = await _deviceRepository.GetCountAsync();
        var availableDevices = await _deviceRepository.GetCountByStatusAsync(DeviceStatus.Available);
        var inUseDevices = await _deviceRepository.GetCountByStatusAsync(DeviceStatus.InUse);
        var pendingDevices = await _deviceRepository.GetCountByStatusAsync(DeviceStatus.PendingAssignment);
        var underRepairDevices = await _deviceRepository.GetCountByStatusAsync(DeviceStatus.UnderRepair);
        var disposedDevices = await _deviceRepository.GetCountByStatusAsync(DeviceStatus.Disposed);
        var totalUsers = await _userRepository.GetCountAsync();

        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetUserId();

        int pendingAssignments;
        int myAssignments = 0;

        if (isAdmin)
        {
            pendingAssignments = await _assignmentRepository.GetPendingCountAsync();
        }
        else if (currentUserId.HasValue)
        {
            pendingAssignments = await _assignmentRepository.GetPendingCountAsync(currentUserId.Value);
            myAssignments = await _assignmentRepository.GetUserAssignmentCountAsync(currentUserId.Value);
        }
        else
        {
            pendingAssignments = 0;
        }

        return new DashboardStatsDto(
            totalDevices,
            availableDevices,
            inUseDevices,
            pendingDevices,
            underRepairDevices,
            disposedDevices,
            totalUsers,
            pendingAssignments,
            myAssignments);
    }
}
