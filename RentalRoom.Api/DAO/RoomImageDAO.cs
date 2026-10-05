using Microsoft.Data.SqlClient;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.DAO;

public class RoomImageDAO
{
    private readonly DbConnectionFactory _connectionFactory;

    public RoomImageDAO(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task InsertAsync(RoomImage image)
    {
        const string sql = """
            INSERT INTO RoomImages
            (
                RoomId,
                Url,
                IsVideo,
                SortOrder
            )
            VALUES
            (
                @RoomId,
                @Url,
                @IsVideo,
                @SortOrder
            );
            """;

        await using var connection =
            _connectionFactory.CreateConnection();

        await using var command =
            new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@RoomId", image.RoomId);
        command.Parameters.AddWithValue("@Url", image.Url);
        command.Parameters.AddWithValue("@IsVideo", image.IsVideo);
        command.Parameters.AddWithValue("@SortOrder", image.SortOrder);

        await connection.OpenAsync();

        await command.ExecuteNonQueryAsync();
    }

    // Overload dùng trong transaction
    public async Task InsertAsync(
        RoomImage image,
        SqlConnection connection,
        SqlTransaction transaction)
    {
        const string sql = """
            INSERT INTO RoomImages (RoomId, Url, IsVideo, SortOrder)
            VALUES (@RoomId, @Url, @IsVideo, @SortOrder);
            """;

        await using var command = new SqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@RoomId", image.RoomId);
        command.Parameters.AddWithValue("@Url", image.Url);
        command.Parameters.AddWithValue("@IsVideo", image.IsVideo);
        command.Parameters.AddWithValue("@SortOrder", image.SortOrder);
        await command.ExecuteNonQueryAsync();
    }

    public async Task<List<RoomImage>> GetByRoomIdAsync(int roomId)
    {
        var images = new List<RoomImage>();
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();
        const string sql = """
        SELECT Id, RoomId, Url, IsVideo, SortOrder
        FROM RoomImages
        WHERE RoomId = @RoomId
        ORDER BY SortOrder ASC, Id ASC;
        """;
        using var command = new SqlCommand(sql, connection);
        command.Parameters.AddWithValue("@RoomId", roomId);
        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            images.Add(new RoomImage
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                RoomId = reader.GetInt32(reader.GetOrdinal("RoomId")),
                Url = reader.GetString(reader.GetOrdinal("Url")),
                IsVideo = reader.GetBoolean(reader.GetOrdinal("IsVideo")),
                SortOrder = reader.GetInt32(reader.GetOrdinal("SortOrder"))
            });
        }
        return images;
    }

    public async Task DeleteByRoomIdAsync(int roomId)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        DELETE FROM RoomImages
        WHERE RoomId = @RoomId;
        """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@RoomId", roomId);

        await command.ExecuteNonQueryAsync();
    }
}