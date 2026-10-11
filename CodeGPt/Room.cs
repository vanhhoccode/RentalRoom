namespace RentalRoom.Api.Entities;

public class Room
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

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; }
    public string? ImageUrl { get; set; }
    public string? CategoryName { get; set; }
    public string? RejectReason { get; set; }
    public List<string> Amenities { get; set; } = new();
    public int ImageCount { get; set; }
}