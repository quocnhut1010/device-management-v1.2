namespace DeviceManagement.Api.DTOs.Devices;

public record UpdateDeviceRequest(
    string Name,
    string? Category,
    string? Model,
    DateTime? PurchasedDate,
    Guid? DeviceTypeId = null,
    Guid? DeviceModelId = null);
