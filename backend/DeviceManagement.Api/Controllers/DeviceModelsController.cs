using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.DeviceModels;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/device-models")]
public class DeviceModelsController : ControllerBase
{
    private readonly IDeviceModelService _service;

    public DeviceModelsController(IDeviceModelService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DeviceModelDto>>>> GetAsync([FromQuery] DeviceModelFilterRequest filter) =>
        Ok(ApiResponse<List<DeviceModelDto>>.Ok(await _service.GetAsync(filter)));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DeviceModelDto>>> GetByIdAsync(Guid id) =>
        Ok(ApiResponse<DeviceModelDto>.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DeviceModelDto>>> CreateAsync(CreateDeviceModelRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Created($"/api/device-models/{result.Id}", ApiResponse<DeviceModelDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DeviceModelDto>>> UpdateAsync(Guid id, UpdateDeviceModelRequest request) =>
        Ok(ApiResponse<DeviceModelDto>.Ok(await _service.UpdateAsync(id, request)));

    [HttpPut("{id:guid}/toggle-status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DeviceModelDto>>> ToggleStatusAsync(Guid id) =>
        Ok(ApiResponse<DeviceModelDto>.Ok(await _service.ToggleStatusAsync(id)));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object?>>> DeleteAsync(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<object?>.Ok(null, "Dòng máy (Model) đã được xóa thành công."));
    }
}
