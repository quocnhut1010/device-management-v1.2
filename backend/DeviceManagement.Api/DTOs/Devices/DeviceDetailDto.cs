using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Devices;

public record DeviceDetailDto(
    Guid Id,
    string Code,
    string Name,
    string SerialNumber,
    string? Category,
    string? Model,
    DeviceStatus Status,
    DateTime? PurchasedDate,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    Guid? DeviceTypeId = null,
    string? DeviceTypeName = null,
    Guid? DeviceModelId = null,
    string? DeviceModelName = null);
