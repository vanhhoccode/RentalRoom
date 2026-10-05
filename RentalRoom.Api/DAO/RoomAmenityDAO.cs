using Microsoft.Data.SqlClient;
using RentalRoom.Api.DTOs.Rooms;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.DAO;

public class RoomAmenityDAO
{
    private readonly DbConnectionFactory _connectionFactory;

    public RoomAmenityDAO(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task DeleteByRoomIdAsync(int roomId)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        DELETE FROM RoomAmenities
        WHERE RoomId = @RoomId;
        """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@RoomId", roomId);

        await command.ExecuteNonQueryAsync();
    }

    public async Task InsertAsync(RoomAmenity roomAmenity)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            INSERT INTO RoomAmenities
            (
                RoomId,
                AmenityId
            )
            VALUES
            (
                @RoomId,
                @AmenityId
            );
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue(
            "@RoomId",
            roomAmenity.RoomId);

        command.Parameters.AddWithValue(
            "@AmenityId",
            roomAmenity.AmenityId);

        await command.ExecuteNonQueryAsync();
    }

    // Overload dùng trong transaction
    public async Task InsertAsync(
        RoomAmenity roomAmenity,
        SqlConnection connection,
        SqlTransaction transaction)
    {
        const string sql = """
            INSERT INTO RoomAmenities (RoomId, AmenityId)
            VALUES (@RoomId, @AmenityId);
            """;

        await using var command = new SqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@RoomId", roomAmenity.RoomId);
        command.Parameters.AddWithValue("@AmenityId", roomAmenity.AmenityId);
        await command.ExecuteNonQueryAsync();
    }
    public async Task<List<AmenityResponse>> GetByRoomIdAsync(int roomId)
    {
        var amenities = new List<AmenityResponse>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        SELECT
            a.Id,
            a.Name
        FROM RoomAmenities ra
        INNER JOIN Amenities a
            ON ra.AmenityId = a.Id
        WHERE ra.RoomId = @RoomId
        ORDER BY a.Id;
        """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@RoomId", roomId);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            amenities.Add(new AmenityResponse
            {
                Id = reader.GetInt32(
                    reader.GetOrdinal("Id")),

                Name = reader.GetString(
                    reader.GetOrdinal("Name"))
            });
        }

        return amenities;
    }

}