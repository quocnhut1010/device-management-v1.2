using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Users;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class UserService(IUserRepository repository, DeviceManagementDbContext context) : IUserService
{
    public async Task<List<UserDto>> GetAsync() =>
        (await repository.GetAsync()).Select(ToDto).ToList();

    public async Task<UserDetailDto> GetByIdAsync(Guid id)
    {
        var user = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException("User not found.");

        return ToDetailDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        if (await repository.ExistsByCodeAsync(request.Code))
        {
            throw new BusinessException("User code already exists.");
        }

        if (await repository.ExistsByEmailAsync(request.Email))
        {
            throw new BusinessException("User email already exists.");
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

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        var user = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException("User not found.");

        user.DepartmentId = request.DepartmentId;
        user.FullName = request.FullName;
        user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;
        user.Status = request.Status;
        user.UpdatedAt = DateTime.UtcNow;

        repository.Update(user);
        await context.SaveChangesAsync();

        return ToDto(user);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await repository.GetByIdAsync(id)
            ?? throw new NotFoundException("User not found.");

        if (await repository.HasAssignmentsAsync(id))
        {
            throw new BusinessException("Cannot delete a user that has assignment history.");
        }

        repository.Delete(user);
        await context.SaveChangesAsync();
    }

    private static UserDto ToDto(User x) =>
        new(x.Id, x.Code, x.FullName, x.Email, x.Status);

    private static UserDetailDto ToDetailDto(User x) =>
        new(x.Id, x.DepartmentId, x.Code, x.FullName, x.Email, x.PhoneNumber, x.Status, x.CreatedAt, x.UpdatedAt);
}

