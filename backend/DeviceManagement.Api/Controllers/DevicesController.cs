using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Devices;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/devices")]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _service;

    public DevicesController(IDeviceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DeviceDto>>>> GetAsync() =>
        Ok(ApiResponse<List<DeviceDto>>.Ok(await _service.GetAsync()));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DeviceDetailDto>>> GetByIdAsync(Guid id) =>
        Ok(ApiResponse<DeviceDetailDto>.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DeviceDto>>> CreateAsync(CreateDeviceRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Created($"/api/devices/{result.Id}", ApiResponse<DeviceDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DeviceDto>>> UpdateAsync(Guid id, UpdateDeviceRequest request) =>
        Ok(ApiResponse<DeviceDto>.Ok(await _service.UpdateAsync(id, request)));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}

