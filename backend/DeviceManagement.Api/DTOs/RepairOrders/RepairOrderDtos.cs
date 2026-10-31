using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.RepairOrders;

public record RepairOrderDto(
    Guid Id,
    string Code,
    Guid? IncidentId,
    string? IncidentTitle,
    Guid DeviceId,
    string? DeviceCode,
    string? DeviceName,
    Guid? AssignedToUserId,
    string? AssignedToUserName,
    RepairStatus Status,
    RepairPriority Priority,
    decimal? EstimatedCost,
    decimal? ActualCost,
    string Description,
    string? ResolutionNotes,
    DateTime? StartDate,
    DateTime? CompletedDate,
    DateTime CreatedAt
);

public record CreateRepairOrderRequest(
    string? Code,
    Guid? IncidentId,
    Guid DeviceId,
    Guid? AssignedToUserId,
    RepairPriority Priority = RepairPriority.Medium,
    decimal? EstimatedCost = null,
    string Description = ""
);

public record AssignRepairOrderRequest(
    Guid AssignedToUserId
);

public record UpdateRepairOrderStatusRequest(
    RepairStatus Status,
    decimal? ActualCost = null,
    string? ResolutionNotes = null
);

public record RepairOrderFilterRequest(
    string? Keyword = null,
    Guid? DeviceId = null,
    Guid? AssignedToUserId = null,
    RepairStatus? Status = null,
    RepairPriority? Priority = null,
    int Page = 1,
    int PageSize = 20
);
