namespace DeviceManagement.Api.DTOs.DeviceAssignments;

public record CreateDeviceAssignmentRequest(Guid DeviceId, Guid UserId, Guid AssignedByUserId, string? Note);
