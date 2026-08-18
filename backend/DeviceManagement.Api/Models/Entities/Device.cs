using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Models.Entities;

public class Device
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Model { get; set; }
    public DeviceStatus Status { get; set; } = DeviceStatus.Available;
    public DateTime? PurchasedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<DeviceAssignment> Assignments { get; set; } = new List<DeviceAssignment>();
    public ICollection<DeviceHistory> Histories { get; set; } = new List<DeviceHistory>();
}
