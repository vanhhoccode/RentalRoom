using RentalRoom.Api.Entities;

namespace RentalRoom.Api.DTOs.Rooms;

public class RoomResponse
{
    public int Id { get; set; }

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
}