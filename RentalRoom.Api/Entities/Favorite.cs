namespace RentalRoom.Api.Entities;

public class Favorite
{
    public int Id { get; set; }
    public int TenantId { get; set; }
    public int RoomId { get; set; }
    public DateTime CreatedAt { get; set; }
}