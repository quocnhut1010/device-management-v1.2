using DeviceManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeviceManagement.Api.Data.Configurations;

public class RepairOrderConfiguration : IEntityTypeConfiguration<RepairOrder>
{
    public void Configure(EntityTypeBuilder<RepairOrder> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Description).IsRequired();
        builder.Property(x => x.ResolutionNotes).HasMaxLength(1000);
        builder.Property(x => x.EstimatedCost).HasColumnType("decimal(18,2)");
        builder.Property(x => x.ActualCost).HasColumnType("decimal(18,2)");

        builder.HasIndex(x => x.Code).IsUnique();

        builder.HasOne(x => x.Device)
            .WithMany(x => x.RepairOrders)
            .HasForeignKey(x => x.DeviceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Incident)
            .WithMany(x => x.RepairOrders)
            .HasForeignKey(x => x.IncidentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AssignedToUser)
            .WithMany()
            .HasForeignKey(x => x.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.DeviceId);
        builder.HasIndex(x => x.AssignedToUserId);
        builder.HasIndex(x => x.Status);
    }
}
