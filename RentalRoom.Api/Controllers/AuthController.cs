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
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request)
    {
        var result = await _authBiz.RegisterAsync(request);

        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            UserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
            Username = User.FindFirstValue(ClaimTypes.Name),
            Role = User.FindFirstValue(ClaimTypes.Role),
            FullName = User.FindFirstValue("fullName")
        });
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login(
    [FromBody] LoginRequest request)
    {
        var result = await _authBiz.LoginAsync(request);
        return Ok(result);
    }
}
