using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Devices;

public record DeviceDto(
    Guid Id,
    string Code,
    string Name,
    string SerialNumber,
    DeviceStatus Status,
    string? Category = null,
    string? Model = null,
    Guid? DeviceTypeId = null,
    string? DeviceTypeName = null,
    Guid? DeviceModelId = null,
    string? DeviceModelName = null);
