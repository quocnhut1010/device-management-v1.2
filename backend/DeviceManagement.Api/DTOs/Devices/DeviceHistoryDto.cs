using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Devices;

public record DeviceHistoryDto(
    Guid Id,
    Guid DeviceId,
    string Action,
    DeviceStatus? OldStatus,
    DeviceStatus? NewStatus,
    string? Description,
    Guid? CreatedByUserId,
    string? CreatedByUserName,
    DateTime CreatedAt,
    string? DeviceName = null);
