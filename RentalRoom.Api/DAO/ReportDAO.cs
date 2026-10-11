using Microsoft.Data.SqlClient;
using RentalRoom.Api.DTOs.Reports;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.DAO;

public class ReportDAO
{
    private readonly DbConnectionFactory _connectionFactory;

    public ReportDAO(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<int> InsertAsync(Report report)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            INSERT INTO Reports
            (
                TenantId,
                RoomId,
                Reason,
                Description,
                Status,
                CreatedAt
            )
            OUTPUT INSERTED.Id
            VALUES
            (
                @TenantId,
                @RoomId,
                @Reason,
                @Description,
                'Pending',
                SYSDATETIME()
            );
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@TenantId", report.TenantId);
        command.Parameters.AddWithValue("@RoomId", report.RoomId);
        command.Parameters.AddWithValue("@Reason", report.Reason);

        command.Parameters.AddWithValue(
            "@Description",
            (object?)report.Description ?? DBNull.Value);

        return Convert.ToInt32(
            await command.ExecuteScalarAsync());
    }

    public async Task<Report?> GetByIdAsync(int id)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            SELECT
                Id,
                TenantId,
                RoomId,
                Reason,
                Description,
                Status,
                ResolvedBy,
                CreatedAt,
                ResolvedAt
            FROM Reports
            WHERE Id = @Id;
            """;

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Id", id);

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return null;

        return new Report
        {
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            TenantId = reader.GetInt32(reader.GetOrdinal("TenantId")),
            RoomId = reader.GetInt32(reader.GetOrdinal("RoomId")),
            Reason = reader.GetString(reader.GetOrdinal("Reason")),

            Description = reader.IsDBNull(reader.GetOrdinal("Description"))
                ? null
                : reader.GetString(reader.GetOrdinal("Description")),

            Status = reader.GetString(reader.GetOrdinal("Status")),

            ResolvedBy = reader.IsDBNull(reader.GetOrdinal("ResolvedBy"))
                ? null
                : reader.GetInt32(reader.GetOrdinal("ResolvedBy")),

            CreatedAt = reader.GetDateTime(
                reader.GetOrdinal("CreatedAt")),

            ResolvedAt = reader.IsDBNull(reader.GetOrdinal("ResolvedAt"))
                ? null
                : reader.GetDateTime(
                    reader.GetOrdinal("ResolvedAt"))
        };
    }

    public async Task<bool> UpdateStatusAsync(
        int id,
        string status,
        int resolvedBy)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
            UPDATE Reports
            SET
                Status = @Status,
                ResolvedBy = @ResolvedBy,
                ResolvedAt = SYSDATETIME()
            WHERE Id = @Id;
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@Id", id);
        command.Parameters.AddWithValue("@Status", status);
        command.Parameters.AddWithValue("@ResolvedBy", resolvedBy);

        var rows = await command.ExecuteNonQueryAsync();

        return rows > 0;
    }

    public async Task<bool> ExistsAsync(int tenantId, int roomId)
    {
        const string sql = """
        SELECT COUNT(1)
        FROM Reports
        WHERE TenantId = @TenantId
          AND RoomId = @RoomId;
        """;

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@TenantId", tenantId);
        command.Parameters.AddWithValue("@RoomId", roomId);

        var count = Convert.ToInt32(
            await command.ExecuteScalarAsync());

        return count > 0;
    }

    public async Task<List<ReportResponse>> GetListAsync(string? status)
    {
        var reports = new List<ReportResponse>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        SELECT
            r.Id,
            r.TenantId,
            u.FullName AS TenantName,
            r.RoomId,
            rm.Title AS RoomTitle,
            rm.Status AS RoomStatus,
            r.Reason,
            r.Description,
            r.Status,
            r.CreatedAt,
            r.ResolvedBy,
            r.ResolvedAt
        FROM Reports r
        INNER JOIN Users u
            ON r.TenantId = u.Id
        INNER JOIN Rooms rm
            ON r.RoomId = rm.Id
        WHERE (@Status IS NULL OR r.Status = @Status)
        ORDER BY r.CreatedAt DESC;
        """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue(
            "@Status",
            (object?)status ?? DBNull.Value);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            reports.Add(new ReportResponse
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),

                TenantId = reader.GetInt32(
                    reader.GetOrdinal("TenantId")),

                TenantName = reader.GetString(
                    reader.GetOrdinal("TenantName")),

                RoomId = reader.GetInt32(
                    reader.GetOrdinal("RoomId")),

                RoomTitle = reader.GetString(
                    reader.GetOrdinal("RoomTitle")),

                RoomStatus = reader.GetString(
                    reader.GetOrdinal("RoomStatus")),

                Reason = reader.GetString(
                    reader.GetOrdinal("Reason")),

                Description = reader.IsDBNull(
                    reader.GetOrdinal("Description"))
                    ? null
                    : reader.GetString(
                        reader.GetOrdinal("Description")),

                Status = reader.GetString(
                    reader.GetOrdinal("Status")),

                CreatedAt = reader.GetDateTime(
                    reader.GetOrdinal("CreatedAt")),

                ResolvedBy = reader.IsDBNull(
                    reader.GetOrdinal("ResolvedBy"))
                    ? null
                    : reader.GetInt32(
                        reader.GetOrdinal("ResolvedBy")),

                ResolvedAt = reader.IsDBNull(
                    reader.GetOrdinal("ResolvedAt"))
                    ? null
                    : reader.GetDateTime(
                        reader.GetOrdinal("ResolvedAt"))
            });
        }

        return reports;
    }
}