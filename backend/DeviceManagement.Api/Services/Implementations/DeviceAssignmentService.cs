using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Common.Models;
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
    private readonly IDeviceService _deviceService;
    private readonly IUserRepository _userRepository;
    private readonly IDeviceHistoryRepository _deviceHistoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeviceAssignmentService(
        IDeviceAssignmentRepository assignmentRepository,
        ICurrentUserService currentUserService,
        IDeviceRepository deviceRepository,
        IDeviceService deviceService,
        IUserRepository userRepository,
        IDeviceHistoryRepository deviceHistoryRepository,
        IUnitOfWork unitOfWork)
    {
        _assignmentRepository = assignmentRepository;
        _currentUserService = currentUserService;
        _deviceRepository = deviceRepository;
        _deviceService = deviceService;
        _userRepository = userRepository;
        _deviceHistoryRepository = deviceHistoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<DeviceAssignmentDto>> GetAsync()
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        Guid? userId = isAdmin ? null : _currentUserService.GetRequiredUserId();
        var assignments = await _assignmentRepository.GetAsync(userId);
        return assignments.Select(ToDto).ToList();
    }

    public async Task<PagedResult<DeviceAssignmentDto>> GetAsync(DeviceAssignmentFilterRequest request)
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetRequiredUserId();
        Guid? targetUserId = isAdmin ? request.UserId : currentUserId;

        var result = await _assignmentRepository.GetPagedAsync(
            request.DeviceId,
            targetUserId,
            request.Status,
            request.Page,
            request.PageSize);

        return new PagedResult<DeviceAssignmentDto>
        {
            Items = result.Items.Select(ToDto).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalItems = result.TotalItems
        };
    }

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

        var oldDeviceStatus = device.Status;

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

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        await _assignmentRepository.AddAsync(assignment);
        await _unitOfWork.SaveChangesAsync();
        await _deviceService.RecalculateStatusAsync(device.Id);

        var currentDevice = await _deviceRepository.GetByIdAsync(device.Id)
            ?? throw new NotFoundException("Device not found.");

        await WriteHistoryAsync(device.Id, request.AssignedByUserId, "AssignmentCreated", oldDeviceStatus, currentDevice.Status, $"Device assigned to user {request.UserId} and waiting for acceptance.");
        await transaction.CommitAsync();

        return ToDto(assignment);
    }

    public Task<DeviceAssignmentDto> AcceptAsync(Guid id) =>
        ChangeStatusAsync(id, DeviceAssignmentStatus.Pending, DeviceAssignmentStatus.Accepted);

    public Task<DeviceAssignmentDto> RejectAsync(Guid id) =>
        ChangeStatusAsync(id, DeviceAssignmentStatus.Pending, DeviceAssignmentStatus.Rejected);

    public Task<DeviceAssignmentDto> ReturnAsync(Guid id) =>
        ChangeStatusAsync(id, DeviceAssignmentStatus.Accepted, DeviceAssignmentStatus.Returned);

    public Task<DeviceAssignmentDto> RevokeAsync(Guid id) =>
        ChangeStatusAsync(id, DeviceAssignmentStatus.Pending, DeviceAssignmentStatus.Revoked);

    private async Task<DeviceAssignmentDto> ChangeStatusAsync(Guid id, DeviceAssignmentStatus expectedStatus, DeviceAssignmentStatus nextStatus)
    {
        var assignment = await _assignmentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Device assignment not found.");

        var actorUserId = _currentUserService.GetRequiredUserId();

        if (assignment.Status != expectedStatus)
        {
            throw new BusinessException($"Assignment must be {expectedStatus}.");
        }

        EnsureActorAllowed(assignment, nextStatus, actorUserId);
        await EnsureWorkflowGuardsAsync(assignment, nextStatus);

        var now = DateTime.UtcNow;
        var oldDeviceStatus = assignment.Device.Status;
        assignment.Status = nextStatus;
        assignment.UpdatedAt = now;
        assignment.AcceptedAt = nextStatus == DeviceAssignmentStatus.Accepted ? now : assignment.AcceptedAt;
        assignment.RejectedAt = nextStatus == DeviceAssignmentStatus.Rejected ? now : assignment.RejectedAt;
        assignment.ReturnedAt = nextStatus == DeviceAssignmentStatus.Returned ? now : assignment.ReturnedAt;
        assignment.RevokedAt = nextStatus == DeviceAssignmentStatus.Revoked ? now : assignment.RevokedAt;

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        _assignmentRepository.Update(assignment);
        await _unitOfWork.SaveChangesAsync();
        await _deviceService.RecalculateStatusAsync(assignment.DeviceId);

        var currentDevice = await _deviceRepository.GetByIdAsync(assignment.DeviceId)
            ?? throw new NotFoundException("Device not found.");

        await WriteHistoryAsync(
            assignment.DeviceId,
            actorUserId,
            GetHistoryAction(nextStatus),
            oldDeviceStatus,
            currentDevice.Status,
            GetHistoryDescription(assignment, nextStatus));

        await transaction.CommitAsync();

        return ToDto(assignment);
    }

    private void EnsureActorAllowed(DeviceAssignment assignment, DeviceAssignmentStatus nextStatus, Guid actorUserId)
    {
        var isAllowed = nextStatus switch
        {
            DeviceAssignmentStatus.Accepted => assignment.UserId == actorUserId,
            DeviceAssignmentStatus.Rejected => assignment.UserId == actorUserId,
            DeviceAssignmentStatus.Returned => assignment.UserId == actorUserId || _currentUserService.IsInRole("Admin"),
            DeviceAssignmentStatus.Revoked => assignment.AssignedByUserId == actorUserId || _currentUserService.IsInRole("Admin"),
            _ => false
        };

        if (!isAllowed)
        {
            throw new ForbiddenException("Actor user is not allowed to perform this action.");
        }
    }

    private async Task EnsureWorkflowGuardsAsync(DeviceAssignment assignment, DeviceAssignmentStatus nextStatus)
    {
        if (nextStatus == DeviceAssignmentStatus.Accepted)
        {
            if (assignment.Device.Status is DeviceStatus.Disposed or DeviceStatus.UnderRepair)
            {
                throw new BusinessException("Device is not available for acceptance.");
            }

            var hasOtherAcceptedAssignment = await _assignmentRepository.HasOtherAcceptedAssignmentAsync(assignment.DeviceId, assignment.Id);

            if (hasOtherAcceptedAssignment)
            {
                throw new BusinessException("Device already has another accepted assignment.");
            }
        }

        if (nextStatus == DeviceAssignmentStatus.Returned)
        {
            if (assignment.Device.Status != DeviceStatus.InUse)
            {
                throw new BusinessException("Device is not currently in use.");
            }

            var activeAcceptedAssignment = await _assignmentRepository.GetActiveAcceptedAssignmentAsync(assignment.DeviceId);

            if (activeAcceptedAssignment is null || activeAcceptedAssignment.Id != assignment.Id)
            {
                throw new BusinessException("Assignment is not current active device usage.");
            }
        }
    }

    private async Task WriteHistoryAsync(
        Guid deviceId,
        Guid? createdByUserId,
        string action,
        DeviceStatus? oldStatus,
        DeviceStatus? newStatus,
        string description)
    {
        await _deviceHistoryRepository.AddAsync(new DeviceHistory
        {
            Id = Guid.NewGuid(),
            DeviceId = deviceId,
            Action = action,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            Description = description,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();
    }

    private static string GetHistoryAction(DeviceAssignmentStatus status) =>
        status switch
        {
            DeviceAssignmentStatus.Accepted => "AssignmentAccepted",
            DeviceAssignmentStatus.Rejected => "AssignmentRejected",
            DeviceAssignmentStatus.Returned => "AssignmentReturned",
            DeviceAssignmentStatus.Revoked => "AssignmentRevoked",
            _ => "AssignmentUpdated"
        };

    private static string GetHistoryDescription(DeviceAssignment assignment, DeviceAssignmentStatus status) =>
        status switch
        {
            DeviceAssignmentStatus.Accepted => $"User {assignment.UserId} accepted assignment.",
            DeviceAssignmentStatus.Rejected => $"User {assignment.UserId} rejected assignment.",
            DeviceAssignmentStatus.Returned => $"User {assignment.UserId} returned device.",
            DeviceAssignmentStatus.Revoked => $"Assignment revoked by user {assignment.AssignedByUserId}.",
            _ => "Assignment status updated."
        };

    private static DeviceAssignmentDto ToDto(DeviceAssignment x) =>
        new(x.Id, x.DeviceId, x.UserId, x.Status, x.AssignedAt);
}
