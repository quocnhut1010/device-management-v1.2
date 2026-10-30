using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Auth;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> LoginAsync(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result is null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Email or password is invalid."));
        }

        return Ok(ApiResponse<LoginResponse>.Ok(result));
    }
}
