namespace RentalRoom.Api.Entities;

// Internal data model used by the authentication business layer.
public class UserProfileInfo
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string RoleCode { get; set; } = string.Empty;
}
