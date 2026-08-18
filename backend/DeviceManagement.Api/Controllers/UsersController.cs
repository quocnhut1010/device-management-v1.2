using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Users;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;

    public UsersController(IUserService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetAsync() =>
        Ok(ApiResponse<List<UserDto>>.Ok(await _service.GetAsync()));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDetailDto>>> GetByIdAsync(Guid id) =>
        Ok(ApiResponse<UserDetailDto>.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateAsync(CreateUserRequest request)
    {
        var result = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetByIdAsync), new { id = result.Id }, ApiResponse<UserDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateAsync(Guid id, UpdateUserRequest request) =>
        Ok(ApiResponse<UserDto>.Ok(await _service.UpdateAsync(id, request)));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}

