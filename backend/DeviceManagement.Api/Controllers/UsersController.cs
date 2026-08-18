using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Users;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(IUserService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetAsync() =>
        Ok(ApiResponse<List<UserDto>>.Ok(await service.GetAsync()));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateAsync(CreateUserRequest request)
    {
        var result = await service.CreateAsync(request);
        return Ok(ApiResponse<UserDto>.Ok(result));
    }
}
