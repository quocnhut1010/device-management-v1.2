namespace DeviceManagement.Api.DTOs.DeviceModels;

public record DeviceModelDto(
    Guid Id,
    Guid DeviceTypeId,
    string? DeviceTypeName,
    string Code,
    string Name,
    string? Manufacturer,
    string? Specifications,
    bool IsActive,
    int DeviceCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateDeviceModelRequest(
    Guid DeviceTypeId,
    string Code,
    string Name,
    string? Manufacturer,
    string? Specifications,
    bool IsActive = true);

public record UpdateDeviceModelRequest(
    Guid DeviceTypeId,
    string Code,
    string Name,
    string? Manufacturer,
    string? Specifications,
    bool IsActive);

public record DeviceModelFilterRequest(
    Guid? DeviceTypeId,
    string? Keyword,
    bool? IsActive);
