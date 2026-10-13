namespace RentalRoom.Api.DTOs.Admin;

// Không chứa PasswordHash hoặc dữ liệu xác thực.
public class AdminUserResponse
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string RoleCode { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
