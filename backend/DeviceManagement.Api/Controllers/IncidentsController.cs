using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Incidents;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/incidents")]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _service;

    public IncidentsController(IIncidentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<IncidentDto>>>> GetAsync([FromQuery] IncidentFilterRequest request) =>
        Ok(ApiResponse<PagedResult<IncidentDto>>.Ok(await _service.GetAsync(request)));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<IncidentDto>>> GetByIdAsync(Guid id) =>
        Ok(ApiResponse<IncidentDto>.Ok(await _service.GetByIdAsync(id)));

    [HttpPost]
    public async Task<ActionResult<ApiResponse<IncidentDto>>> CreateAsync(CreateIncidentRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Created($"/api/incidents/{result.Id}", ApiResponse<IncidentDto>.Ok(result));
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<IncidentDto>>> UpdateStatusAsync(Guid id, UpdateIncidentStatusRequest request) =>
        Ok(ApiResponse<IncidentDto>.Ok(await _service.UpdateStatusAsync(id, request)));
}
