using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.DeviceAssignments;

public record DeviceAssignmentFilterRequest(
    Guid? DeviceId,
    Guid? UserId,
    DeviceAssignmentStatus? Status,
    int Page = 1,
    int PageSize = 20);
