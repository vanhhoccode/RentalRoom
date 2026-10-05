using Microsoft.AspNetCore.Mvc;
using RentalRoom.Api.DAO;

namespace RentalRoom.Api.Controllers;

[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    private readonly DbConnectionFactory _connectionFactory;

    public TestController(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet("db")]
    public async Task<IActionResult> TestDatabase()
    {
        await using var connection = _connectionFactory.CreateConnection();

        await connection.OpenAsync();

        return Ok(new
        {
            message = "Database connection successful."
        });
    }
}