using RentalRoom.Api.DTOs.Rooms;

namespace RentalRoom.Api.DTOs.Rooms;

public class RoomSearchResponse
{
    public List<RoomResponse> Rooms { get; set; } = new();

    public int TotalCount { get; set; }

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalPages =>
        (int)Math.Ceiling((double)TotalCount / PageSize);
}