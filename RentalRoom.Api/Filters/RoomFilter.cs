namespace RentalRoom.Api.Filters;
public class RoomSearchFilter
{
    public string? Keyword { get; set; }
    public int? CategoryId { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}