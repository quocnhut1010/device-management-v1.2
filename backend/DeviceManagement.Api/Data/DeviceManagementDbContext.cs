using DeviceManagement.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Data;

public class DeviceManagementDbContext : DbContext
{
    public DeviceManagementDbContext(DbContextOptions<DeviceManagementDbContext> options) : base(options)
    {
    }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<DeviceType> DeviceTypes => Set<DeviceType>();
    public DbSet<DeviceModel> DeviceModels => Set<DeviceModel>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<DeviceAssignment> DeviceAssignments => Set<DeviceAssignment>();
    public DbSet<DeviceHistory> DeviceHistories => Set<DeviceHistory>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<RepairOrder> RepairOrders => Set<RepairOrder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DeviceManagementDbContext).Assembly);
    }
}
