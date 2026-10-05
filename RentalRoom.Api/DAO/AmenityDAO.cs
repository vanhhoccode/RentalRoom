using Microsoft.Data.SqlClient;
using RentalRoom.Api.Biz;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.DAO;

public class AmenityDAO
{
    private readonly DbConnectionFactory _connectionFactory;

    public AmenityDAO(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }



    public async Task<List<Amenity>> GetAllAsync()
    {
        var amenities = new List<Amenity>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            SELECT Id, Name
            FROM Amenities
            ORDER BY Id;
            """;

        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            amenities.Add(new Amenity
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Name = reader.GetString(reader.GetOrdinal("Name"))
            });
        }

        return amenities;
    }
}
