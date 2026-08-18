using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Models.Entities;

public class User
{
    public Guid Id { get; set; }
    public Guid? DepartmentId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Department? Department { get; set; }
    public ICollection<DeviceAssignment> DeviceAssignments { get; set; } = new List<DeviceAssignment>();
}
