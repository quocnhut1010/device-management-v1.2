using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Devices;

public record DeviceFilterRequest(
    string? Keyword,
    DeviceStatus? Status,
    int Page = 1,
    int PageSize = 20);

