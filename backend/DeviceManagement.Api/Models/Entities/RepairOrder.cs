using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Models.Entities;

public class RepairOrder
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public Guid? IncidentId { get; set; }
    public Guid DeviceId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public RepairStatus Status { get; set; } = RepairStatus.Pending;
    public RepairPriority Priority { get; set; } = RepairPriority.Medium;
    public decimal? EstimatedCost { get; set; }
    public decimal? ActualCost { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ResolutionNotes { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Incident? Incident { get; set; }
    public Device Device { get; set; } = null!;
    public User? AssignedToUser { get; set; }
}
