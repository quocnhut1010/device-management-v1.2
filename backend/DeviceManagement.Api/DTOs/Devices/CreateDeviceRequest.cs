namespace DeviceManagement.Api.DTOs.Devices;

public record CreateDeviceRequest(string Code, string Name, string SerialNumber, string? Category, string? Model, DateTime? PurchasedDate);
