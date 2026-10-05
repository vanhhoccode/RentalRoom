using Microsoft.AspNetCore.Mvc;
using RentalRoom.Api.Biz;

namespace RentalRoom.Api.Controllers;

[ApiController]
[Route("api/amenities")]
public class AmenityController : ControllerBase
{
    private readonly AmenityBiz _amenityBiz;

    public AmenityController(AmenityBiz amenityBiz)
    {
        _amenityBiz = amenityBiz;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var amenities = await _amenityBiz.GetAllAsync();

        return Ok(amenities);
    }
}