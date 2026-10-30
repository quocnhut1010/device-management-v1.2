using DeviceManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeviceManagement.Api.Data.Configurations;

public class DeviceModelConfiguration : IEntityTypeConfiguration<DeviceModel>
{
    public void Configure(EntityTypeBuilder<DeviceModel> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Manufacturer).HasMaxLength(100);
        builder.HasIndex(x => x.Code).IsUnique();

        builder.HasOne(x => x.DeviceType)
            .WithMany(x => x.DeviceModels)
            .HasForeignKey(x => x.DeviceTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Devices)
            .WithOne(x => x.DeviceModel)
            .HasForeignKey(x => x.DeviceModelId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
