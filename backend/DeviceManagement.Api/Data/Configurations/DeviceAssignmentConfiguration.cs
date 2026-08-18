using DeviceManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeviceManagement.Api.Data.Configurations;

public class DeviceAssignmentConfiguration : IEntityTypeConfiguration<DeviceAssignment>
{
    public void Configure(EntityTypeBuilder<DeviceAssignment> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Note).HasMaxLength(500);
        builder.HasOne(x => x.Device).WithMany(x => x.Assignments).HasForeignKey(x => x.DeviceId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.User).WithMany(x => x.DeviceAssignments).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.AssignedByUser).WithMany().HasForeignKey(x => x.AssignedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.DeviceId, x.Status });
    }
}
