namespace RentalRoom.Api.DTOs.Reports;

public class ReportResponse
{
    public int Id { get; set; }
    public int TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public string RoomTitle { get; set; } = string.Empty;
    public string RoomStatus { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
}