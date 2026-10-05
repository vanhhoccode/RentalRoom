using Microsoft.AspNetCore.Http;

namespace RentalRoom.Api.DTOs.Rooms;

public class CreateRoomRequest
{
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Area { get; set; }
    public string District { get; set; } = string.Empty;
    public string Ward { get; set; } = string.Empty;
    public string AddressDetail { get; set; } = string.Empty;
    public List<int> AmenityIds { get; set; } = new();
    public List<IFormFile> Images { get; set; } = new();
}