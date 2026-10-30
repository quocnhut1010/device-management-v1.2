using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.DeviceAssignments;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IDeviceAssignmentService
{
    Task<List<DeviceAssignmentDto>> GetAsync();
    Task<PagedResult<DeviceAssignmentDto>> GetAsync(DeviceAssignmentFilterRequest request);
    Task<DeviceAssignmentDto> CreateAsync(CreateDeviceAssignmentRequest request);
    Task<DeviceAssignmentDto> AcceptAsync(Guid id);
    Task<DeviceAssignmentDto> RejectAsync(Guid id);
    Task<DeviceAssignmentDto> ReturnAsync(Guid id);
    Task<DeviceAssignmentDto> RevokeAsync(Guid id);
}
