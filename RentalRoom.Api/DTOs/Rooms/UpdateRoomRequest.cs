namespace RentalRoom.Api.DTOs.Rooms;
using Microsoft.AspNetCore.Http;

public class UpdateRoomRequest
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

    // false = giữ nguyên ảnh cũ
    // true = thay toàn bộ gallery bằng Images mới
    public bool ReplaceImages { get; set; }
}