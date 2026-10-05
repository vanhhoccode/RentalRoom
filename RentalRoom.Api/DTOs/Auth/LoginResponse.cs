namespace RentalRoom.Api.DTOs.Auth;

public class LoginResponse
{
    public int UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string RoleCode { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;
}