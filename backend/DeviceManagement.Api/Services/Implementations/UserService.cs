using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Users;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserService(
        IUserRepository repository,
        IDepartmentRepository departmentRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _departmentRepository = departmentRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<UserDto>> GetAsync() =>
        (await _repository.GetAsync()).Select(ToDto).ToList();

    public async Task<PagedResult<UserDto>> GetAsync(UserFilterRequest request)
    {
        var pagedUsers = await _repository.GetPagedAsync(request.Keyword, request.Status, request.Page, request.PageSize);

        return new PagedResult<UserDto>
        {
            Items = pagedUsers.Items.Select(ToDto).ToList(),
            Page = pagedUsers.Page,
            PageSize = pagedUsers.PageSize,
            TotalItems = pagedUsers.TotalItems
        };
    }

    public async Task<UserDetailDto> GetByIdAsync(Guid id)
    {
        var user = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("User not found.");

        return ToDetailDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        if (await _repository.ExistsByCodeAsync(request.Code))
        {
            throw new BusinessException("User code already exists.");
        }

        if (await _repository.ExistsByEmailAsync(request.Email))
        {
            throw new BusinessException("User email already exists.");
        }

        Department? department = null;
        if (request.DepartmentId.HasValue)
        {
            department = await _departmentRepository.GetByIdAsync(request.DepartmentId.Value)
                ?? throw new NotFoundException("Phòng ban không tồn tại.");

            if (!department.IsActive)
            {
                throw new BusinessException("Phòng ban đã bị vô hiệu hóa hoặc không hợp lệ.");
            }
        }

        var role = !string.IsNullOrWhiteSpace(request.Role) ? request.Role.Trim() : "Employee";
        if (role is not ("Admin" or "Employee" or "Technician"))
        {
            throw new BusinessException($"Vai trò '{role}' không hợp lệ. Chỉ chấp nhận Admin, Employee hoặc Technician.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            DepartmentId = department?.Id,
            Code = request.Code,
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Role = role,
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        user.Department = department;
        return ToDto(user);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("User not found.");

        Department? department = null;
        if (request.DepartmentId.HasValue)
        {
            department = await _departmentRepository.GetByIdAsync(request.DepartmentId.Value)
                ?? throw new NotFoundException("Phòng ban không tồn tại.");

            if (!department.IsActive)
            {
                throw new BusinessException("Phòng ban đã bị vô hiệu hóa hoặc không hợp lệ.");
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var role = request.Role.Trim();
            if (role is not ("Admin" or "Employee" or "Technician"))
            {
                throw new BusinessException($"Vai trò '{role}' không hợp lệ. Chỉ chấp nhận Admin, Employee hoặc Technician.");
            }
            user.Role = role;
        }

        user.DepartmentId = department?.Id;
        user.FullName = request.FullName;
        user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;
        user.Status = request.Status;
        user.UpdatedAt = DateTime.UtcNow;

        _repository.Update(user);
        await _unitOfWork.SaveChangesAsync();

        user.Department = department;
        return ToDto(user);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("User not found.");

        if (await _repository.HasAssignmentsAsync(id))
        {
            throw new BusinessException("Cannot delete a user that has assignment history.");
        }

        _repository.Delete(user);
        await _unitOfWork.SaveChangesAsync();
    }

    private static UserDto ToDto(User x) =>
        new(x.Id, x.Code, x.FullName, x.Email, x.Status, x.DepartmentId, x.Department?.Name, x.Role);

    private static UserDetailDto ToDetailDto(User x) =>
        new(x.Id, x.DepartmentId, x.Code, x.FullName, x.Email, x.PhoneNumber, x.Status, x.CreatedAt, x.UpdatedAt, x.Department?.Name, x.Role);
}
