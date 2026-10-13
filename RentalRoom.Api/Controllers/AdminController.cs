using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalRoom.Api.Biz;
using RentalRoom.Api.DTOs.Admin;

namespace RentalRoom.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly AdminBiz _adminBiz;

    public AdminController(AdminBiz adminBiz)
    {
        _adminBiz = adminBiz;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        return Ok(await _adminBiz.GetDashboardAsync());
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        return Ok(await _adminBiz.GetStatisticsAsync());
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? keyword,
        [FromQuery] string? roleCode,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        return Ok(await _adminBiz.GetUsersAsync(
            keyword, roleCode, isActive, page, pageSize));
    }

    [HttpGet("users/{id:int}")]
    public async Task<IActionResult> GetUser(int id)
    {
        return Ok(await _adminBiz.GetUserAsync(id));
    }

    [HttpPatch("users/{id:int}/status")]
    public async Task<IActionResult> SetUserStatus(
        int id,
        [FromBody] UpdateAccountStatusRequest request)
    {
        await _adminBiz.SetUserStatusAsync(id, request.IsActive);
        return Ok(new
        {
            success = true,
            isActive = request.IsActive,
            message = request.IsActive
                ? "Đã mở khóa tài khoản."
                : "Đã khóa tài khoản."
        });
    }
}
