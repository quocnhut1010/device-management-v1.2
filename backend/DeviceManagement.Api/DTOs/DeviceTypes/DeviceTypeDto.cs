namespace DeviceManagement.Api.DTOs.DeviceTypes;

public record DeviceTypeDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    bool IsActive,
    int ModelCount,
    int DeviceCount,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CreateDeviceTypeRequest(
    string Code,
    string Name,
    string? Description,
    bool IsActive = true);

public record UpdateDeviceTypeRequest(
    string Code,
    string Name,
    string? Description,
    bool IsActive);

public record DeviceTypeFilterRequest(
    string? Keyword,
    bool? IsActive);
