namespace RentalRoom.Api.DTOs.Common;

public class ErrorResponse
{
    public bool Success { get; set; }

    public string ErrorCode { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;
}