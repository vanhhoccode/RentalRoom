using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalRoom.Api.Biz;
using RentalRoom.Api.DTOs.Rooms;
using RentalRoom.Api.Filters;

namespace RentalRoom.Api.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomController : ControllerBase
{
    private readonly RoomBiz _roomBiz;

    public RoomController(RoomBiz roomBiz)
    {
        _roomBiz = roomBiz;
    }

    // =========================
    // TẠO TIN ĐĂNG
    // POST /api/rooms
    // =========================
    [Authorize(Roles = "LANDLORD")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromForm] CreateRoomRequest request)
    {
        var result = await _roomBiz.CreateRoomAsync(request);

        return StatusCode(201, result);
    }

    // =========================
    // XEM CHI TIẾT PHÒNG
    // GET /api/rooms/{id}
    // =========================
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var room = await _roomBiz.GetRoomByIdAsync(id);

        if (room == null)
        {
            return NotFound();
        }

        return Ok(room);
    }

    // =========================
    // LẤY DANH SÁCH CATEGORY
    // GET /api/rooms/categories
    // =========================
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var result = await _roomBiz.GetCategories();

        return Ok(result);
    }

    // =========================
    // CẬP NHẬT TRẠNG THÁI PHÒNG
    // PATCH /api/rooms/{id}/status
    // =========================
    [Authorize(Roles = "LANDLORD")]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] UpdateRoomStatusRequest request)
    {
        await _roomBiz.UpdateRoomStatusAsync(
            id,
            request.Status);

        return Ok(new
        {
            success = true,
            message = "Cập nhật trạng thái phòng thành công."
        });
    }

    // =========================
    // LẤY DANH SÁCH TIN CHỜ DUYỆT
    // GET /api/rooms/pending
    // =========================
    [Authorize(Roles = "ADMIN")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingRooms()
    {
        var rooms = await _roomBiz.GetPendingRoomsAsync();

        return Ok(rooms);
    }

    // =========================
    // TỪ CHỐI TIN ĐĂNG
    // PATCH /api/rooms/{id}/reject
    // =========================
    [Authorize(Roles = "ADMIN")]
    [HttpPatch("{id:int}/reject")]
    public async Task<IActionResult> Reject(
        int id,
        [FromBody] RejectRoomRequest request)
    {
        await _roomBiz.RejectRoomAsync(id, request.RejectReason);

        return Ok(new
        {
            success = true,
            message = "Đã từ chối tin đăng."
        });
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _roomBiz.DeleteRoomAsync(id);

        return Ok(new
        {
            success = true,
            message = "Đã xóa tin đăng."
        });
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
     int id,
     [FromForm] UpdateRoomRequest request)
    {
        await _roomBiz.UpdateRoomAsync(id, request);

        return Ok(new
        {
            success = true,
            message = "Cập nhật tin đăng thành công. Tin đang chờ Admin duyệt lại.",
            status = "Pending"
        });
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpGet("my/action-items")]
    public async Task<IActionResult> GetMyActionItems()
    {
        var result = await _roomBiz.GetMyActionItemsAsync();

        return Ok(result);
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyRooms()
    {
        var rooms = await _roomBiz.GetMyRoomsAsync();

        return Ok(rooms);
    }

    // =========================
    // DUYỆT TIN ĐĂNG
    // PATCH /api/rooms/{id}/approve
    // =========================
    [Authorize(Roles = "ADMIN")]
    [HttpPatch("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        await _roomBiz.ApproveRoomAsync(id);

        return Ok(new
        {
            success = true,
            message = "Duyệt tin đăng thành công."
        });
    }

    // =========================
    // TÌM KIẾM PHÒNG
    // GET /api/rooms
    // =========================
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] RoomSearchFilter filter)
    {
        var result = await _roomBiz.SearchAsync(filter);

        return Ok(result);
    }

    // =========================
    // TEST QUYỀN ADMIN
    // GET /api/rooms/admin-test
    // =========================
    [Authorize(Roles = "ADMIN")]
    [HttpGet("admin-test")]
    public IActionResult AdminTest()
    {
        return Ok("You are admin.");
    }
}