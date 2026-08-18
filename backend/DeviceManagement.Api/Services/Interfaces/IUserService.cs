using DeviceManagement.Api.DTOs.Users;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAsync();
    Task<UserDetailDto> GetByIdAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserRequest request);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request);
    Task DeleteAsync(Guid id);
}

