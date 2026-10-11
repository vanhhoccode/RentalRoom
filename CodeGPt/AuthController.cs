using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalRoom.Api.Biz;
using RentalRoom.Api.DTOs.Auth;
using System.Security.Claims;

namespace RentalRoom.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthBiz _authBiz;

    public AuthController(AuthBiz authBiz)
    {
        _authBiz = authBiz;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authBiz.RegisterAsync(request);
        return Ok(result);
    }

    // Trả thông tin hồ sơ hiện tại từ database, có bổ sung Phone.
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Không xác định được tài khoản đăng nhập." });
        }

        var profile = await _authBiz.GetMyProfileAsync(userId);

        // Giữ các field cũ (UserId, Username, Role, FullName), bổ sung Email/Phone.
        return Ok(new
        {
            UserId = profile.UserId.ToString(),
            Username = profile.Username,
            Role = profile.RoleCode,
            RoleCode = profile.RoleCode,
            FullName = profile.FullName,
            Email = profile.Email,
            Phone = profile.Phone
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authBiz.LoginAsync(request);
        return Ok(result);
    }

    // Dùng chung cho cả TENANT và LANDLORD.
    [HttpPatch("me/phone")]
    [Authorize(Roles = "TENANT,LANDLORD")]
    public async Task<IActionResult> UpdateMyPhone([FromBody] UpdatePhoneRequest request)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Không xác định được tài khoản đăng nhập." });
        }

        var phone = await _authBiz.UpdateMyPhoneAsync(userId, request);

        return Ok(new
        {
            success = true,
            message = "Cập nhật số điện thoại thành công.",
            phone
        });
    }

    // Dùng chung cho cả TENANT và LANDLORD.
    [HttpPatch("me/password")]
    [Authorize(Roles = "TENANT,LANDLORD")]
    public async Task<IActionResult> ChangeMyPassword([FromBody] ChangePasswordRequest request)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Không xác định được tài khoản đăng nhập." });
        }

        await _authBiz.ChangeMyPasswordAsync(userId, request);

        return Ok(new
        {
            success = true,
            message = "Đổi mật khẩu thành công."
        });
    }

    private bool TryGetCurrentUserId(out int userId)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdValue, out userId) && userId > 0;
    }
}
