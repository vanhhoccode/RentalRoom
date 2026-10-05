namespace RentalRoom.Api.Common.Auth;

public interface ITokenService
{
    string GenerateToken(
        int userId,
        string username,
        string roleCode,
        string fullName);
}