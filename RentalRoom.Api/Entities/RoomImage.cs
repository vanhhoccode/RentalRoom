namespace RentalRoom.Api.Entities;

public class RoomImage
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsVideo { get; set; }
    public int SortOrder { get; set; }
}