using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Users;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class UserService(IUserRepository repository, DeviceManagementDbContext context) : IUserService
{
    public async Task<List<UserDto>> GetAsync() => (await repository.GetAsync()).Select(ToDto).ToList();

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        if (await repository.ExistsByCodeAsync(request.Code))
        {
            throw new BusinessException("User code already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            DepartmentId = request.DepartmentId,
            Code = request.Code,
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(user);
        await context.SaveChangesAsync();
        return ToDto(user);
    }

    private static UserDto ToDto(User x) => new(x.Id, x.Code, x.FullName, x.Email, x.Status);
}
