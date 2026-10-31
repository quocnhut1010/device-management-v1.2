using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Incidents;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IIncidentService
{
    Task<PagedResult<IncidentDto>> GetAsync(IncidentFilterRequest request);
    Task<IncidentDto> GetByIdAsync(Guid id);
    Task<IncidentDto> CreateAsync(CreateIncidentRequest request);
    Task<IncidentDto> UpdateStatusAsync(Guid id, UpdateIncidentStatusRequest request);
}
