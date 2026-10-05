using Microsoft.Data.SqlClient;
using RentalRoom.Api.DTOs.Favorites;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.DAO;

public class FavoriteDAO
{
    private readonly DbConnectionFactory _connectionFactory;

    public FavoriteDAO(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> ExistsAsync(int tenantId, int roomId)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            SELECT COUNT(1)
            FROM Favorites
            WHERE TenantId = @TenantId
              AND RoomId = @RoomId;
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@TenantId", tenantId);
        command.Parameters.AddWithValue("@RoomId", roomId);

        var count = Convert.ToInt32(
            await command.ExecuteScalarAsync());

        return count > 0;
    }

    public async Task<int> InsertAsync(Favorite favorite)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            INSERT INTO Favorites
            (
                TenantId,
                RoomId,
                CreatedAt
            )
            OUTPUT INSERTED.Id
            VALUES
            (
                @TenantId,
                @RoomId,
                SYSDATETIME()
            );
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@TenantId", favorite.TenantId);
        command.Parameters.AddWithValue("@RoomId", favorite.RoomId);

        return Convert.ToInt32(
            await command.ExecuteScalarAsync());
    }

    public async Task<bool> DeleteAsync(int tenantId, int roomId)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            DELETE FROM Favorites
            WHERE TenantId = @TenantId
              AND RoomId = @RoomId;
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@TenantId", tenantId);
        command.Parameters.AddWithValue("@RoomId", roomId);

        var rows = await command.ExecuteNonQueryAsync();

        return rows > 0;
    }

    public async Task<List<FavoriteResponse>> GetByTenantIdAsync(int tenantId)
    {
        var favorites = new List<FavoriteResponse>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            SELECT
                f.Id AS FavoriteId,
                r.Id AS RoomId,
                r.Title,
                r.Price,
                r.Area,
                r.District,
                r.Ward,
                r.Status,
                f.CreatedAt,
                img.Url AS ImageUrl
            FROM Favorites f
            INNER JOIN Rooms r
                ON f.RoomId = r.Id
            OUTER APPLY
            (
                SELECT TOP 1 Url
                FROM RoomImages
                WHERE RoomId = r.Id
                ORDER BY SortOrder ASC, Id ASC
            ) img
            WHERE f.TenantId = @TenantId
              AND r.IsDeleted = 0
            ORDER BY f.CreatedAt DESC;
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@TenantId", tenantId);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            favorites.Add(new FavoriteResponse
            {
                FavoriteId = reader.GetInt32(
                    reader.GetOrdinal("FavoriteId")),

                RoomId = reader.GetInt32(
                    reader.GetOrdinal("RoomId")),

                Title = reader.GetString(
                    reader.GetOrdinal("Title")),

                Price = reader.GetDecimal(
                    reader.GetOrdinal("Price")),

                Area = reader.GetDecimal(
                    reader.GetOrdinal("Area")),

                District = reader.GetString(
                    reader.GetOrdinal("District")),

                Ward = reader.GetString(
                    reader.GetOrdinal("Ward")),

                Status = reader.GetString(
                    reader.GetOrdinal("Status")),

                CreatedAt = reader.GetDateTime(
                    reader.GetOrdinal("CreatedAt")),

                ImageUrl = reader.IsDBNull(
                    reader.GetOrdinal("ImageUrl"))
                    ? null
                    : reader.GetString(
                        reader.GetOrdinal("ImageUrl"))
            });
        }

        return favorites;
    }
}