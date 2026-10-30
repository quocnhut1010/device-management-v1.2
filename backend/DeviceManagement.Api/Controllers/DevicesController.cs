using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Devices;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[Authorize]
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
    public async Task<ActionResult<ApiResponse<PagedResult<DeviceDto>>>> GetAsync([FromQuery] DeviceFilterRequest request) =>
        Ok(ApiResponse<PagedResult<DeviceDto>>.Ok(await _service.GetAsync(request)));

    [HttpGet("history")]
    public async Task<ActionResult<ApiResponse<PagedResult<DeviceHistoryDto>>>> GetAllHistoryAsync(
        [FromQuery] Guid? deviceId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20) =>
        Ok(ApiResponse<PagedResult<DeviceHistoryDto>>.Ok(await _service.GetAllHistoryAsync(deviceId, page, pageSize)));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DeviceDetailDto>>> GetByIdAsync(Guid id) =>
        Ok(ApiResponse<DeviceDetailDto>.Ok(await _service.GetByIdAsync(id)));

    [HttpGet("{id:guid}/history")]
    public async Task<ActionResult<ApiResponse<PagedResult<DeviceHistoryDto>>>> GetHistoryAsync(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20) =>
        Ok(ApiResponse<PagedResult<DeviceHistoryDto>>.Ok(await _service.GetHistoryAsync(id, page, pageSize)));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DeviceDto>>> CreateAsync(CreateDeviceRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Created($"/api/devices/{result.Id}", ApiResponse<DeviceDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DeviceDto>>> UpdateAsync(Guid id, UpdateDeviceRequest request) =>
        Ok(ApiResponse<DeviceDto>.Ok(await _service.UpdateAsync(id, request)));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
