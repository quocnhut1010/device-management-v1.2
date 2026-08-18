using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.DeviceAssignments;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[ApiController]
[Route("api/device-assignments")]
public class DeviceAssignmentsController(IDeviceAssignmentService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<DeviceAssignmentDto>>>> GetAsync() =>
        Ok(ApiResponse<List<DeviceAssignmentDto>>.Ok(await service.GetAsync()));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DeviceAssignmentDto>>> CreateAsync(CreateDeviceAssignmentRequest request)
    {
        var result = await service.CreateAsync(request);
        return Ok(ApiResponse<DeviceAssignmentDto>.Ok(result));
    }

    [HttpPost("{id:guid}/accept")]
    public async Task<ActionResult<ApiResponse<DeviceAssignmentDto>>> AcceptAsync(Guid id) =>
        Ok(ApiResponse<DeviceAssignmentDto>.Ok(await service.AcceptAsync(id)));

    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<ApiResponse<DeviceAssignmentDto>>> RejectAsync(Guid id) =>
        Ok(ApiResponse<DeviceAssignmentDto>.Ok(await service.RejectAsync(id)));

    [HttpPost("{id:guid}/return")]
    public async Task<ActionResult<ApiResponse<DeviceAssignmentDto>>> ReturnAsync(Guid id) =>
        Ok(ApiResponse<DeviceAssignmentDto>.Ok(await service.ReturnAsync(id)));
}
