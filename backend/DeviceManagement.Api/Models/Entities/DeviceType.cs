namespace DeviceManagement.Api.Models.Entities;

public class DeviceType
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<DeviceModel> DeviceModels { get; set; } = new List<DeviceModel>();
    public ICollection<Device> Devices { get; set; } = new List<Device>();
}
