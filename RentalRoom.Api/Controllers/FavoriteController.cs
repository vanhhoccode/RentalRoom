using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalRoom.Api.Biz;
using RentalRoom.Api.DTOs.Favorites;

namespace RentalRoom.Api.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize(Roles = "TENANT")]
public class FavoriteController : ControllerBase
{
    private readonly FavoriteBiz _favoriteBiz;

    public FavoriteController(FavoriteBiz favoriteBiz)
    {
        _favoriteBiz = favoriteBiz;
    }

    [HttpPost]
    public async Task<IActionResult> Add(
        [FromBody] AddFavoriteRequest request)
    {
        await _favoriteBiz.AddAsync(request);

        return StatusCode(201, new
        {
            success = true,
            message = "Đã lưu phòng yêu thích."
        });
    }

    [HttpDelete("{roomId:int}")]
    public async Task<IActionResult> Remove(int roomId)
    {
        await _favoriteBiz.RemoveAsync(roomId);

        return Ok(new
        {
            success = true,
            message = "Đã bỏ phòng khỏi danh sách yêu thích."
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
    {
        var favorites =
            await _favoriteBiz.GetMyFavoritesAsync();

        return Ok(favorites);
    }
}