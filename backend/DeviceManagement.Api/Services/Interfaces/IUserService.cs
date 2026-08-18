using DeviceManagement.Api.DTOs.Users;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAsync();
    Task<UserDto> CreateAsync(CreateUserRequest request);
}
