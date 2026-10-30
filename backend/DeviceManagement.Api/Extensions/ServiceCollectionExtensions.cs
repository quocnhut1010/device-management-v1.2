using DeviceManagement.Api.Repositories.Implementations;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Implementations;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IDeviceRepository, DeviceRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IDeviceAssignmentRepository, DeviceAssignmentRepository>();
        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<IDeviceTypeRepository, DeviceTypeRepository>();
        services.AddScoped<IDeviceModelRepository, DeviceModelRepository>();
        services.AddScoped<IDeviceHistoryRepository, DeviceHistoryRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IDeviceService, DeviceService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDeviceAssignmentService, DeviceAssignmentService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IDeviceTypeService, DeviceTypeService>();
        services.AddScoped<IDeviceModelService, DeviceModelService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
