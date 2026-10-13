namespace RentalRoom.Api.DTOs.Admin;

public class AdminPendingRoomResponse
{
    public int Id { get; set; }
    public int LandlordId { get; set; }
    public string? LandlordName { get; set; }
    public string? LandlordPhone { get; set; }
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Area { get; set; }
    public string District { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string AddressDetail { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ImageUrl { get; set; }
    public string? RejectReason { get; set; }
}
