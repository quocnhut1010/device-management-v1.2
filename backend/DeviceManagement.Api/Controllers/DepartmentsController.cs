using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Departments;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/departments")]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _service;

    public DepartmentsController(IDepartmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetAsync([FromQuery] DepartmentFilterRequest filter) =>
        Ok(ApiResponse<List<DepartmentDto>>.Ok(await _service.GetAsync(filter)));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> GetByIdAsync(Guid id) =>
        Ok(ApiResponse<DepartmentDto>.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> CreateAsync(CreateDepartmentRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Created($"/api/departments/{result.Id}", ApiResponse<DepartmentDto>.Ok(result));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> UpdateAsync(Guid id, UpdateDepartmentRequest request) =>
        Ok(ApiResponse<DepartmentDto>.Ok(await _service.UpdateAsync(id, request)));

    [HttpPut("{id:guid}/toggle-status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> ToggleStatusAsync(Guid id) =>
        Ok(ApiResponse<DepartmentDto>.Ok(await _service.ToggleStatusAsync(id)));

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object?>>> DeleteAsync(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<object?>.Ok(null, "Phòng ban đã được xóa thành công."));
    }
}
