using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Models.Entities;

public class DeviceHistory
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public string Action { get; set; } = string.Empty;
    public DeviceStatus? OldStatus { get; set; }
    public DeviceStatus? NewStatus { get; set; }
    public string? Description { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }

    public Device Device { get; set; } = default!;
    public User? CreatedByUser { get; set; }
}
