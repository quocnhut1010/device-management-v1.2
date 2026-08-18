using DeviceManagement.Api.Models.Enums;

namespace DeviceManagement.Api.DTOs.Users;

public record UserFilterRequest(
    string? Keyword,
    UserStatus? Status,
    int Page = 1,
    int PageSize = 20);

