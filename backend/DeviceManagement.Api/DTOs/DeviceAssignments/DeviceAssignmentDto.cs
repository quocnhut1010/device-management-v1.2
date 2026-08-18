using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.DeviceAssignments;

public record DeviceAssignmentDto(Guid Id, Guid DeviceId, Guid UserId, DeviceAssignmentStatus Status, DateTime AssignedAt);
