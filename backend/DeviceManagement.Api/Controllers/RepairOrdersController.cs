using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.RepairOrders;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[Authorize(Roles = "Admin,Technician")]
[ApiController]
[Route("api/repair-orders")]
public class RepairOrdersController : ControllerBase
{
    private readonly IRepairOrderService _service;

    public RepairOrdersController(IRepairOrderService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<RepairOrderDto>>>> GetAsync([FromQuery] RepairOrderFilterRequest request) =>
        Ok(ApiResponse<PagedResult<RepairOrderDto>>.Ok(await _service.GetAsync(request)));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<RepairOrderDto>>> GetByIdAsync(Guid id) =>
        Ok(ApiResponse<RepairOrderDto>.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<RepairOrderDto>>> CreateAsync(CreateRepairOrderRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Created($"/api/repair-orders/{result.Id}", ApiResponse<RepairOrderDto>.Ok(result));
    }

    [HttpPost("{id:guid}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<RepairOrderDto>>> AssignTechnicianAsync(Guid id, AssignRepairOrderRequest request) =>
        Ok(ApiResponse<RepairOrderDto>.Ok(await _service.AssignTechnicianAsync(id, request)));

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<RepairOrderDto>>> UpdateStatusAsync(Guid id, UpdateRepairOrderStatusRequest request) =>
        Ok(ApiResponse<RepairOrderDto>.Ok(await _service.UpdateStatusAsync(id, request)));
}
