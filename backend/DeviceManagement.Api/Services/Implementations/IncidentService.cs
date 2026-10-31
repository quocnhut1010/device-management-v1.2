using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.Incidents;
using DeviceManagement.Api.Models.Entities;
using DeviceManagement.Api.Models.Enums;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;

namespace DeviceManagement.Api.Services.Implementations;

public class IncidentService : IIncidentService
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IDeviceAssignmentRepository _assignmentRepository;
    private readonly IDeviceHistoryRepository _deviceHistoryRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public IncidentService(
        IIncidentRepository incidentRepository,
        IDeviceRepository deviceRepository,
        IDeviceAssignmentRepository assignmentRepository,
        IDeviceHistoryRepository deviceHistoryRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _incidentRepository = incidentRepository;
        _deviceRepository = deviceRepository;
        _assignmentRepository = assignmentRepository;
        _deviceHistoryRepository = deviceHistoryRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<IncidentDto>> GetAsync(IncidentFilterRequest request)
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetRequiredUserId();

        Guid? targetUserId = isAdmin ? request.ReportedByUserId : currentUserId;

        var result = await _incidentRepository.GetPagedAsync(
            request.Keyword,
            request.DeviceId,
            targetUserId,
            request.Status,
            request.Severity,
            request.Page,
            request.PageSize);

        return new PagedResult<IncidentDto>
        {
            Items = result.Items.Select(ToDto).ToList(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalItems = result.TotalItems
        };
    }

    public async Task<IncidentDto> GetByIdAsync(Guid id)
    {
        var incident = await _incidentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Sự cố không tồn tại.");

        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetRequiredUserId();

        if (!isAdmin && incident.ReportedByUserId != currentUserId)
        {
            throw new ForbiddenException("Bạn không có quyền xem thông tin sự cố này.");
        }

        return ToDto(incident);
    }

    public async Task<IncidentDto> CreateAsync(CreateIncidentRequest request)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId)
            ?? throw new NotFoundException("Thiết bị không tồn tại.");

        var isAdmin = _currentUserService.IsInRole("Admin");
        var currentUserId = _currentUserService.GetRequiredUserId();

        if (!isAdmin)
        {
            var hasAccess = await _assignmentRepository.HasUserAssignmentForDeviceAsync(request.DeviceId, currentUserId);
            if (!hasAccess)
            {
                throw new ForbiddenException("Bạn chỉ được báo cáo sự cố cho thiết bị đã hoặc đang được bàn giao cho bạn.");
            }
        }

        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            DeviceId = request.DeviceId,
            ReportedByUserId = currentUserId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Severity = request.Severity,
            Status = IncidentStatus.Reported,
            ReportedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        await _incidentRepository.AddAsync(incident);
        await _deviceHistoryRepository.AddAsync(new DeviceHistory
        {
            Id = Guid.NewGuid(),
            DeviceId = device.Id,
            Action = "IncidentReported",
            OldStatus = device.Status,
            NewStatus = device.Status,
            Description = $"Sự cố '{incident.Title}' (Mức độ: {incident.Severity}) được báo cáo trên hệ thống.",
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();

        incident.Device = device;
        return ToDto(incident);
    }

    public async Task<IncidentDto> UpdateStatusAsync(Guid id, UpdateIncidentStatusRequest request)
    {
        var isAdmin = _currentUserService.IsInRole("Admin");
        if (!isAdmin)
        {
            throw new ForbiddenException("Chỉ Quản trị viên mới có quyền cập nhật trạng thái sự cố.");
        }

        var incident = await _incidentRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Sự cố không tồn tại.");

        var currentUserId = _currentUserService.GetRequiredUserId();

        if (incident.Status != request.Status)
        {
            EnsureValidTransition(incident.Status, request.Status);
            incident.Status = request.Status;
        }

        if (request.Severity.HasValue)
        {
            incident.Severity = request.Severity.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.ResolutionNotes))
        {
            incident.ResolutionNotes = request.ResolutionNotes.Trim();
        }

        if (request.Status == IncidentStatus.Resolved)
        {
            incident.ResolvedAt = DateTime.UtcNow;
        }

        incident.UpdatedAt = DateTime.UtcNow;

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        _incidentRepository.Update(incident);
        await _deviceHistoryRepository.AddAsync(new DeviceHistory
        {
            Id = Guid.NewGuid(),
            DeviceId = incident.DeviceId,
            Action = "IncidentStatusUpdated",
            OldStatus = incident.Device.Status,
            NewStatus = incident.Device.Status,
            Description = $"Sự cố '{incident.Title}' được cập nhật trạng thái sang {incident.Status}.",
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.SaveChangesAsync();
        await transaction.CommitAsync();

        return ToDto(incident);
    }

    private static void EnsureValidTransition(IncidentStatus current, IncidentStatus next)
    {
        var isValid = current switch
        {
            IncidentStatus.Reported => next is IncidentStatus.InReview or IncidentStatus.Approved or IncidentStatus.Rejected,
            IncidentStatus.InReview => next is IncidentStatus.Approved or IncidentStatus.Rejected,
            IncidentStatus.Approved => next is IncidentStatus.Resolved or IncidentStatus.Closed,
            IncidentStatus.Rejected => next is IncidentStatus.Closed,
            IncidentStatus.Resolved => next is IncidentStatus.Closed,
            _ => false
        };

        if (!isValid)
        {
            throw new BusinessException($"Không thể chuyển trạng thái sự cố từ {current} sang {next}.");
        }
    }

    private static IncidentDto ToDto(Incident x) =>
        new(
            x.Id,
            x.DeviceId,
            x.Device?.Code,
            x.Device?.Name,
            x.ReportedByUserId,
            x.ReportedByUser?.FullName,
            x.Title,
            x.Description,
            x.Severity,
            x.Status,
            x.ResolutionNotes,
            x.ReportedAt,
            x.ResolvedAt,
            x.CreatedAt,
            x.RepairOrders?.Count > 0
        );
}
