using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Devices;

public record DeviceDto(Guid Id, string Code, string Name, string SerialNumber, DeviceStatus Status);
