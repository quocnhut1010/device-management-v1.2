using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Devices;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/devices")]
public class DevicesController(IDeviceService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DeviceDto>>>> GetAsync() =>
        Ok(ApiResponse<List<DeviceDto>>.Ok(await service.GetAsync()));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DeviceDto>>> CreateAsync(CreateDeviceRequest request)
    {
        var result = await service.CreateAsync(request);
        return Ok(ApiResponse<DeviceDto>.Ok(result));
    }
}
