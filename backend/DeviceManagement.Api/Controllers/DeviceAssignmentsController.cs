using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.DeviceAssignments;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/device-assignments")]
public class DeviceAssignmentsController : ControllerBase
{
    private readonly IDeviceAssignmentService _service;

    public DeviceAssignmentsController(IDeviceAssignmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DeviceAssignmentDto>>>> GetAsync() =>
        Ok(ApiResponse<List<DeviceAssignmentDto>>.Ok(await _service.GetAsync()));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DeviceAssignmentDto>>> CreateAsync(CreateDeviceAssignmentRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Ok(ApiResponse<DeviceAssignmentDto>.Ok(result));
    }

    [HttpPost("{id:guid}/accept")]
    public async Task<ActionResult<ApiResponse<DeviceAssignmentDto>>> AcceptAsync(Guid id) =>
        Ok(ApiResponse<DeviceAssignmentDto>.Ok(await _service.AcceptAsync(id)));

    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<ApiResponse<DeviceAssignmentDto>>> RejectAsync(Guid id) =>
        Ok(ApiResponse<DeviceAssignmentDto>.Ok(await _service.RejectAsync(id)));

    [HttpPost("{id:guid}/return")]
    public async Task<ActionResult<ApiResponse<DeviceAssignmentDto>>> ReturnAsync(Guid id) =>
        Ok(ApiResponse<DeviceAssignmentDto>.Ok(await _service.ReturnAsync(id)));
}
