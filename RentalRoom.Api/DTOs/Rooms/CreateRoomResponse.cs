namespace RentalRoom.Api.DTOs.Rooms;

public class CreateRoomResponse
{
    public int RoomId { get; set; }

    public string Status { get; set; } = string.Empty;

    public List<string> ImageUrls { get; set; } = new();
}