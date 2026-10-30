using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Data;
using DeviceManagement.Api.DTOs.Users;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Api.Services.Implementations;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly DeviceManagementDbContext _context;

    public UserService(IUserRepository repository, DeviceManagementDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<List<UserDto>> GetAsync() =>
        (await _repository.GetAsync()).Select(ToDto).ToList();

    public async Task<PagedResult<UserDto>> GetAsync(UserFilterRequest request)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : Math.Min(request.PageSize, 100);

        var query = _context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var keyword = request.Keyword.Trim();
            query = query.Where(x => x.Code.Contains(keyword) || x.FullName.Contains(keyword) || x.Email.Contains(keyword));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToDto(x))
            .ToListAsync();

        return new PagedResult<UserDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
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

        await _repository.AddAsync(user);
        await _context.SaveChangesAsync();

        return ToDto(user);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _repository.GetByIdAsync(id)
            ?? throw new NotFoundException("User not found.");

        user.DepartmentId = request.DepartmentId;
        user.FullName = request.FullName;
        user.Email = request.Email;
        user.PhoneNumber = request.PhoneNumber;
        user.Status = request.Status;
        user.UpdatedAt = DateTime.UtcNow;

        _repository.Update(user);
        await _context.SaveChangesAsync();

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
        await _context.SaveChangesAsync();
}

    private static UserDto ToDto(User x) =>
        new(x.Id, x.Code, x.FullName, x.Email, x.Status);

    private static UserDetailDto ToDetailDto(User x) =>
        new(x.Id, x.DepartmentId, x.Code, x.FullName, x.Email, x.PhoneNumber, x.Status, x.CreatedAt, x.UpdatedAt);
}

