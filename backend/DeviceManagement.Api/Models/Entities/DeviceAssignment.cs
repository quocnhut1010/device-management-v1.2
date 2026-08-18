using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Models.Entities;

public class DeviceAssignment
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public Guid UserId { get; set; }
    public Guid AssignedByUserId { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? RejectedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DeviceAssignmentStatus Status { get; set; } = DeviceAssignmentStatus.Pending;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Device Device { get; set; } = default!;
    public User User { get; set; } = default!;
    public User AssignedByUser { get; set; } = default!;
}
