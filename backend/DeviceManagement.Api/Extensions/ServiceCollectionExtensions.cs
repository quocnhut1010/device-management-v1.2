using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Implementations will be registered after repository and service classes are filled in the next step.
        return services;
    }
}
