using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Models.Entities;

public class Incident
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public Guid ReportedByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IncidentSeverity Severity { get; set; } = IncidentSeverity.Medium;
    public IncidentStatus Status { get; set; } = IncidentStatus.Reported;
    public string? ResolutionNotes { get; set; }
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Device Device { get; set; } = null!;
    public User ReportedByUser { get; set; } = null!;
    public ICollection<RepairOrder> RepairOrders { get; set; } = new List<RepairOrder>();
}
