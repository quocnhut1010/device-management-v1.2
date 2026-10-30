using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.DeviceTypes;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/device-types")]
public class DeviceTypesController : ControllerBase
{
    private readonly IDeviceTypeService _service;

    public DeviceTypesController(IDeviceTypeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DeviceTypeDto>>>> GetAsync([FromQuery] DeviceTypeFilterRequest filter) =>
        Ok(ApiResponse<List<DeviceTypeDto>>.Ok(await _service.GetAsync(filter)));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DeviceTypeDto>>> GetByIdAsync(Guid id) =>
        Ok(ApiResponse<DeviceTypeDto>.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DeviceTypeDto>>> CreateAsync(CreateDeviceTypeRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Created($"/api/device-types/{result.Id}", ApiResponse<DeviceTypeDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DeviceTypeDto>>> UpdateAsync(Guid id, UpdateDeviceTypeRequest request) =>
        Ok(ApiResponse<DeviceTypeDto>.Ok(await _service.UpdateAsync(id, request)));

    [HttpPut("{id:guid}/toggle-status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DeviceTypeDto>>> ToggleStatusAsync(Guid id) =>
        Ok(ApiResponse<DeviceTypeDto>.Ok(await _service.ToggleStatusAsync(id)));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object?>>> DeleteAsync(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<object?>.Ok(null, "Loại thiết bị đã được xóa thành công."));
    }
}
