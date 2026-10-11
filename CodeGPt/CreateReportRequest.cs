namespace RentalRoom.Api.DTOs.Reports;

public class CreateReportRequest
{
    public int RoomId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Description { get; set; }
}