using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.DeviceAssignments;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class DeviceAssignmentService : IDeviceAssignmentService
{
    private readonly IDeviceAssignmentRepository _assignmentRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IUserRepository _userRepository;
    private readonly DeviceManagementDbContext _context;

    public DeviceAssignmentService(
        IDeviceAssignmentRepository assignmentRepository,
        IDeviceRepository deviceRepository,
        IUserRepository userRepository,
        DeviceManagementDbContext context)
    {
        _assignmentRepository = assignmentRepository;
        _deviceRepository = deviceRepository;
        _userRepository = userRepository;
        _context = context;
    }

    public async Task<List<DeviceAssignmentDto>> GetAsync() =>
        (await _assignmentRepository.GetAsync()).Select(ToDto).ToList();

    public async Task<DeviceAssignmentDto> CreateAsync(CreateDeviceAssignmentRequest request)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId)
            ?? throw new NotFoundException("Device not found.");

        _ = await _userRepository.GetByIdAsync(request.UserId)
            ?? throw new NotFoundException("User not found.");

        _ = await _userRepository.GetByIdAsync(request.AssignedByUserId)
            ?? throw new NotFoundException("Assigned by user not found.");

        if (device.Status is DeviceStatus.Disposed or DeviceStatus.UnderRepair)
        {
            throw new BusinessException("Device is not available for assignment.");
        }

        if (await _assignmentRepository.HasDeviceAssignmentAsync(request.DeviceId, DeviceAssignmentStatus.Pending, DeviceAssignmentStatus.Accepted))
        {
            throw new BusinessException("Device already has an active assignment.");
        }

        var assignment = new DeviceAssignment
        {
            Id = Guid.NewGuid(),
            DeviceId = request.DeviceId,
            UserId = request.UserId,
            AssignedByUserId = request.AssignedByUserId,
            AssignedAt = DateTime.UtcNow,
            Status = DeviceAssignmentStatus.Pending,
            Note = request.Note,
            CreatedAt = DateTime.UtcNow
        };

        device.Status = DeviceStatus.PendingAssignment;
        device.UpdatedAt = DateTime.UtcNow;

        await _assignmentRepository.AddAsync(assignment);
        _deviceRepository.Update(device);
        await _context.SaveChangesAsync();

        return ToDto(assignment);
    }

    public Task<DeviceAssignmentDto> AcceptAsync(Guid id) =>
        ChangeStatusAsync(id, DeviceAssignmentStatus.Pending, DeviceAssignmentStatus.Accepted);

    public Task<DeviceAssignmentDto> RejectAsync(Guid id) =>
        ChangeStatusAsync(id, DeviceAssignmentStatus.Pending, DeviceAssignmentStatus.Rejected);

    public Task<DeviceAssignmentDto> ReturnAsync(Guid id) =>
        ChangeStatusAsync(id, DeviceAssignmentStatus.Accepted, DeviceAssignmentStatus.Returned);

    private async Task<DeviceAssignmentDto> ChangeStatusAsync(Guid id, DeviceAssignmentStatus expectedStatus, DeviceAssignmentStatus nextStatus)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device assignment not found.");

        if (assignment.Status != expectedStatus)
        {
            throw new BusinessException($"Assignment must be {expectedStatus}.");
        }

        var now = DateTime.UtcNow;
        assignment.Status = nextStatus;
        assignment.UpdatedAt = now;
        assignment.AcceptedAt = nextStatus == DeviceAssignmentStatus.Accepted ? now : assignment.AcceptedAt;
        assignment.RejectedAt = nextStatus == DeviceAssignmentStatus.Rejected ? now : assignment.RejectedAt;
        assignment.ReturnedAt = nextStatus == DeviceAssignmentStatus.Returned ? now : assignment.ReturnedAt;

        assignment.Device.Status = nextStatus == DeviceAssignmentStatus.Accepted
            ? DeviceStatus.InUse
            : DeviceStatus.Available;
        assignment.Device.UpdatedAt = now;

        _assignmentRepository.Update(assignment);
        await _context.SaveChangesAsync();

        return ToDto(assignment);
    }

    private static DeviceAssignmentDto ToDto(DeviceAssignment x) =>
        new(x.Id, x.DeviceId, x.UserId, x.Status, x.AssignedAt);
}
