namespace DeviceManagement.Api.Models.Entities;

public class DeviceModel
{
    public Guid Id { get; set; }
    public Guid DeviceTypeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? Specifications { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public DeviceType? DeviceType { get; set; }
    public ICollection<Device> Devices { get; set; } = new List<Device>();
}
