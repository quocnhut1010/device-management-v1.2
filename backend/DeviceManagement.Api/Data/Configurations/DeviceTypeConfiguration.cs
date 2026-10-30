using DeviceManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeviceManagement.Api.Data.Configurations;

public class DeviceTypeConfiguration : IEntityTypeConfiguration<DeviceType>
{
    public void Configure(EntityTypeBuilder<DeviceType> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.HasIndex(x => x.Code).IsUnique();

        builder.HasMany(x => x.DeviceModels)
            .WithOne(x => x.DeviceType)
            .HasForeignKey(x => x.DeviceTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Devices)
            .WithOne(x => x.DeviceType)
            .HasForeignKey(x => x.DeviceTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
