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

        services.AddScoped<IDeviceService, DeviceService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDeviceAssignmentService, DeviceAssignmentService>();

        return services;
    }
}
