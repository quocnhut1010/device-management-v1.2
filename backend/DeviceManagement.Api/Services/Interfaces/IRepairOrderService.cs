using DeviceManagement.Api.Common.Models;
using DeviceManagement.Api.DTOs.RepairOrders;

namespace DeviceManagement.Api.Services.Interfaces;

public interface IRepairOrderService
{
    Task<PagedResult<RepairOrderDto>> GetAsync(RepairOrderFilterRequest request);
    Task<RepairOrderDto> GetByIdAsync(Guid id);
    Task<RepairOrderDto> CreateAsync(CreateRepairOrderRequest request);
    Task<RepairOrderDto> AssignTechnicianAsync(Guid id, AssignRepairOrderRequest request);
    Task<RepairOrderDto> UpdateStatusAsync(Guid id, UpdateRepairOrderStatusRequest request);
}
