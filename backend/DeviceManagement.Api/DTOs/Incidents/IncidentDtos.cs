using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Incidents;

public record IncidentDto(
    Guid Id,
    Guid DeviceId,
    string? DeviceCode,
    string? DeviceName,
    Guid ReportedByUserId,
    string? ReportedByUserName,
    string Title,
    string Description,
    IncidentSeverity Severity,
    IncidentStatus Status,
    string? ResolutionNotes,
    DateTime ReportedAt,
    DateTime? ResolvedAt,
    DateTime CreatedAt,
    bool HasRepairOrder
);

public record CreateIncidentRequest(
    Guid DeviceId,
    string Title,
    string Description,
    IncidentSeverity Severity = IncidentSeverity.Medium
);

public record UpdateIncidentStatusRequest(
    IncidentStatus Status,
    IncidentSeverity? Severity = null,
    string? ResolutionNotes = null
);

public record IncidentFilterRequest(
    string? Keyword = null,
    Guid? DeviceId = null,
    Guid? ReportedByUserId = null,
    IncidentStatus? Status = null,
    IncidentSeverity? Severity = null,
    int Page = 1,
    int PageSize = 20
);
