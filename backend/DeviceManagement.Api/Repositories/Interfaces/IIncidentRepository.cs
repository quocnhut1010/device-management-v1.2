using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IIncidentRepository
{
    Task<PagedResult<Incident>> GetPagedAsync(
        string? keyword,
        Guid? deviceId,
        Guid? reportedByUserId,
        IncidentStatus? status,
        IncidentSeverity? severity,
        int page,
        int pageSize);

    Task<Incident?> GetByIdAsync(Guid id);
    Task<int> GetCountAsync(IncidentStatus? status = null, Guid? reportedByUserId = null);
    Task AddAsync(Incident incident);
    void Update(Incident incident);
    void Delete(Incident incident);
}
