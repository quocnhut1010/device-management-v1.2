using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Dashboard;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly DeviceManagementDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DashboardService(DeviceManagementDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var totalDevices = await _context.Devices.CountAsync();
        var availableDevices = await _context.Devices.CountAsync(d => d.Status == DeviceStatus.Available);
        var inUseDevices = await _context.Devices.CountAsync(d => d.Status == DeviceStatus.InUse);
        var pendingDevices = await _context.Devices.CountAsync(d => d.Status == DeviceStatus.PendingAssignment);
        var underRepairDevices = await _context.Devices.CountAsync(d => d.Status == DeviceStatus.UnderRepair);
        var disposedDevices = await _context.Devices.CountAsync(d => d.Status == DeviceStatus.Disposed);
        var totalUsers = await _context.Users.CountAsync();

        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetUserId();

        int pendingAssignments;
        int myAssignments = 0;

        if (isAdmin)
        {
            pendingAssignments = await _context.DeviceAssignments.CountAsync(a => a.Status == DeviceAssignmentStatus.Pending);
        }
        else if (currentUserId.HasValue)
        {
            pendingAssignments = await _context.DeviceAssignments.CountAsync(a => a.UserId == currentUserId.Value && a.Status == DeviceAssignmentStatus.Pending);
            myAssignments = await _context.DeviceAssignments.CountAsync(a => a.UserId == currentUserId.Value);
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
