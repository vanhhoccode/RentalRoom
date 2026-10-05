using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using RentalRoom.Api.DTOs.Common;

namespace RentalRoom.Api.Common.Exceptions;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(
            exception,
            "Unhandled exception occurred.");

        int statusCode;
        string errorCode;
        string message;

        if (exception is AppException appException)
        {
            statusCode = appException.StatusCode;
            errorCode = appException.ErrorCode;
            message = appException.Message;
        }
        else
        {
            statusCode = StatusCodes.Status500InternalServerError;
            errorCode = "INTERNAL_SERVER_ERROR";
            message = "Đã xảy ra lỗi trong hệ thống.";
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType =
            "application/json; charset=utf-8";

        var response = new ErrorResponse
        {
            Success = false,
            ErrorCode = errorCode,
            Message = message
        };

        await httpContext.Response.WriteAsync(
            JsonSerializer.Serialize(response),
            cancellationToken);

        return true;
    }
}