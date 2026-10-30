using DeviceManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeviceManagement.Api.Data.Configurations;

public class DeviceConfiguration : IEntityTypeConfiguration<Device>
{
    public void Configure(EntityTypeBuilder<Device> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.SerialNumber).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Category).HasMaxLength(100);
        builder.Property(x => x.Model).HasMaxLength(100);
        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasIndex(x => x.SerialNumber).IsUnique();
    }
}
