using Microsoft.Data.SqlClient;
using System.Data;
using RentalRoom.Api.DTOs.Admin;

namespace RentalRoom.Api.DAO;

public class AdminDAO
{
    private readonly DbConnectionFactory _connectionFactory;

    public AdminDAO(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<AdminDashboardResponse> GetDashboardAsync()
    {
        const string sql = """
            SELECT
                (SELECT COUNT(1) FROM Users) AS TotalUsers,
                (SELECT COUNT(1) FROM Users WHERE IsActive = 1) AS ActiveUsers,
                (SELECT COUNT(1) FROM Users WHERE IsActive = 0) AS DisabledUsers,
                (SELECT COUNT(1) FROM Users u INNER JOIN Roles r ON r.Id = u.RoleId WHERE r.RoleCode = 'TENANT') AS TotalTenants,
                (SELECT COUNT(1) FROM Users u INNER JOIN Roles r ON r.Id = u.RoleId WHERE r.RoleCode = 'LANDLORD') AS TotalLandlords,

                (SELECT COUNT(1) FROM Rooms WHERE IsDeleted = 0) AS TotalRooms,
                (SELECT COUNT(1) FROM Rooms WHERE IsDeleted = 0 AND Status = 'Pending') AS PendingRooms,
                (SELECT COUNT(1) FROM Rooms WHERE IsDeleted = 0 AND Status = 'Available') AS AvailableRooms,
                (SELECT COUNT(1) FROM Rooms WHERE IsDeleted = 0 AND Status = 'Rented') AS RentedRooms,
                (SELECT COUNT(1) FROM Rooms WHERE IsDeleted = 0 AND Status = 'Rejected') AS RejectedRooms,

                (SELECT COUNT(1) FROM Reports) AS TotalReports,
                (SELECT COUNT(1) FROM Reports WHERE Status = 'Pending') AS PendingReports,
                (SELECT COUNT(1) FROM Reports WHERE Status = 'Resolved') AS ResolvedReports,
                (SELECT COUNT(1) FROM Reports WHERE Status = 'Rejected') AS RejectedReports;
            """;

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
        {
            return new AdminDashboardResponse();
        }

        int GetInt(string column) => reader.GetInt32(reader.GetOrdinal(column));

        return new AdminDashboardResponse
        {
            TotalUsers = GetInt("TotalUsers"),
            ActiveUsers = GetInt("ActiveUsers"),
            DisabledUsers = GetInt("DisabledUsers"),
            TotalTenants = GetInt("TotalTenants"),
            TotalLandlords = GetInt("TotalLandlords"),
            TotalRooms = GetInt("TotalRooms"),
            PendingRooms = GetInt("PendingRooms"),
            AvailableRooms = GetInt("AvailableRooms"),
            RentedRooms = GetInt("RentedRooms"),
            RejectedRooms = GetInt("RejectedRooms"),
            TotalReports = GetInt("TotalReports"),
            PendingReports = GetInt("PendingReports"),
            ResolvedReports = GetInt("ResolvedReports"),
            RejectedReports = GetInt("RejectedReports")
        };
    }

    public async Task<AdminStatisticsResponse> GetStatisticsAsync()
    {
        var result = new AdminStatisticsResponse();
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string roomSql = """
            SELECT s.Status, COUNT(r.Id) AS [Count]
            FROM (VALUES
                (N'Pending', 1),
                (N'Available', 2),
                (N'Rented', 3),
                (N'Rejected', 4)
            ) AS s(Status, SortOrder)
            LEFT JOIN Rooms r
                ON r.Status = s.Status AND r.IsDeleted = 0
            GROUP BY s.Status, s.SortOrder
            ORDER BY s.SortOrder;
            """;

        await using (var command = new SqlCommand(roomSql, connection))
        await using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                result.RoomsByStatus.Add(new CountByStatusResponse
                {
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    Count = reader.GetInt32(reader.GetOrdinal("Count"))
                });
            }
        }

        const string reportSql = """
            SELECT s.Status, COUNT(r.Id) AS [Count]
            FROM (VALUES
                (N'Pending', 1),
                (N'Resolved', 2),
                (N'Rejected', 3)
            ) AS s(Status, SortOrder)
            LEFT JOIN Reports r ON r.Status = s.Status
            GROUP BY s.Status, s.SortOrder
            ORDER BY s.SortOrder;
            """;

        await using (var command = new SqlCommand(reportSql, connection))
        await using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                result.ReportsByStatus.Add(new CountByStatusResponse
                {
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    Count = reader.GetInt32(reader.GetOrdinal("Count"))
                });
            }
        }

        const string usersSql = """
            SELECT r.RoleCode, COUNT(u.Id) AS [Count]
            FROM Roles r
            LEFT JOIN Users u ON u.RoleId = r.Id
            GROUP BY r.RoleCode
            ORDER BY r.RoleCode;
            """;

        await using (var command = new SqlCommand(usersSql, connection))
        await using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                result.UsersByRole.Add(new CountByRoleResponse
                {
                    RoleCode = reader.GetString(reader.GetOrdinal("RoleCode")),
                    Count = reader.GetInt32(reader.GetOrdinal("Count"))
                });
            }
        }

        return result;
    }

    public async Task<(List<AdminUserResponse> Items, int TotalCount)> GetManagedUsersAsync(
        string? keyword,
        string? roleCode,
        bool? isActive,
        int page,
        int pageSize)
    {
        const string whereSql = """
            FROM Users u
            INNER JOIN Roles r ON r.Id = u.RoleId
            WHERE r.RoleCode IN ('TENANT', 'LANDLORD')
              AND (@Keyword IS NULL OR
                   u.Username LIKE '%' + @Keyword + '%' OR
                   u.FullName LIKE '%' + @Keyword + '%' OR
                   u.Email LIKE '%' + @Keyword + '%' OR
                   u.Phone LIKE '%' + @Keyword + '%')
              AND (@RoleCode IS NULL OR r.RoleCode = @RoleCode)
              AND (@IsActive IS NULL OR u.IsActive = @IsActive)
            """;

        var items = new List<AdminUserResponse>();
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var countSql = "SELECT COUNT(1) " + whereSql + ";";
        await using (var countCommand = new SqlCommand(countSql, connection))
        {
            AddUserFilters(countCommand, keyword, roleCode, isActive);
            var value = await countCommand.ExecuteScalarAsync();
            var totalCount = Convert.ToInt32(value);

            const string listSelect = """
                SELECT
                    u.Id, u.Username, u.Email, u.Phone, u.FullName,
                    r.RoleCode, u.IsActive, u.CreatedAt, u.UpdatedAt
                """;
            var listSql = listSelect + whereSql + " ORDER BY u.CreatedAt DESC, u.Id DESC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;";
            await using var listCommand = new SqlCommand(listSql, connection);
            AddUserFilters(listCommand, keyword, roleCode, isActive);
            listCommand.Parameters.Add("@Offset", SqlDbType.Int).Value = (page - 1) * pageSize;
            listCommand.Parameters.Add("@PageSize", SqlDbType.Int).Value = pageSize;

            await using var reader = await listCommand.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var phoneOrdinal = reader.GetOrdinal("Phone");
                var updatedAtOrdinal = reader.GetOrdinal("UpdatedAt");
                items.Add(new AdminUserResponse
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Username = reader.GetString(reader.GetOrdinal("Username")),
                    Email = reader.GetString(reader.GetOrdinal("Email")),
                    Phone = reader.IsDBNull(phoneOrdinal) ? null : reader.GetString(phoneOrdinal),
                    FullName = reader.GetString(reader.GetOrdinal("FullName")),
                    RoleCode = reader.GetString(reader.GetOrdinal("RoleCode")),
                    IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt = reader.IsDBNull(updatedAtOrdinal) ? null : reader.GetDateTime(updatedAtOrdinal)
                });
            }

            return (items, totalCount);
        }
    }

    public async Task<AdminUserResponse?> GetManagedUserByIdAsync(int userId)
    {
        const string sql = """
            SELECT
                u.Id, u.Username, u.Email, u.Phone, u.FullName,
                r.RoleCode, u.IsActive, u.CreatedAt, u.UpdatedAt
            FROM Users u
            INNER JOIN Roles r ON r.Id = u.RoleId
            WHERE u.Id = @UserId
              AND r.RoleCode IN ('TENANT', 'LANDLORD');
            """;

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@UserId", SqlDbType.Int).Value = userId;
        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
        {
            return null;
        }

        var phoneOrdinal = reader.GetOrdinal("Phone");
        var updatedAtOrdinal = reader.GetOrdinal("UpdatedAt");
        return new AdminUserResponse
        {
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            Username = reader.GetString(reader.GetOrdinal("Username")),
            Email = reader.GetString(reader.GetOrdinal("Email")),
            Phone = reader.IsDBNull(phoneOrdinal) ? null : reader.GetString(phoneOrdinal),
            FullName = reader.GetString(reader.GetOrdinal("FullName")),
            RoleCode = reader.GetString(reader.GetOrdinal("RoleCode")),
            IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            UpdatedAt = reader.IsDBNull(updatedAtOrdinal) ? null : reader.GetDateTime(updatedAtOrdinal)
        };
    }

    public async Task<bool> SetManagedUserStatusAsync(int userId, bool isActive)
    {
        const string sql = """
            UPDATE u
            SET u.IsActive = @IsActive,
                u.UpdatedAt = SYSDATETIME()
            FROM Users u
            INNER JOIN Roles r ON r.Id = u.RoleId
            WHERE u.Id = @UserId
              AND r.RoleCode IN ('TENANT', 'LANDLORD')
              AND u.IsActive <> @IsActive;
            """;

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@UserId", SqlDbType.Int).Value = userId;
        command.Parameters.Add("@IsActive", SqlDbType.Bit).Value = isActive;
        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static void AddUserFilters(
        SqlCommand command,
        string? keyword,
        string? roleCode,
        bool? isActive)
    {
        command.Parameters.Add("@Keyword", SqlDbType.NVarChar, 200)
            .Value = string.IsNullOrWhiteSpace(keyword) ? DBNull.Value : keyword.Trim();
        command.Parameters.Add("@RoleCode", SqlDbType.NVarChar, 20)
            .Value = (object?)roleCode ?? DBNull.Value;
        command.Parameters.Add("@IsActive", SqlDbType.Bit)
            .Value = (object?)isActive ?? DBNull.Value;
    }
}
