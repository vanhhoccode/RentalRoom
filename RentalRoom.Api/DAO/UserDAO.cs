using Microsoft.Data.SqlClient;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.DAO
{
    public class UserDAO
    {
        private readonly DbConnectionFactory _connectionFactory;
        public UserDAO(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }
        public async Task<bool> ExistsByUsernameAsync(string username)
        {
            const string sql = """
        SELECT COUNT(1)
        FROM Users
        WHERE Username = @Username;
        """
            ;

            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);

            command.Parameters.AddWithValue("@Username", username);

            await connection.OpenAsync();

            var count = Convert.ToInt32(await command.ExecuteScalarAsync());

            return count > 0;
        }

        public async Task<bool> ExistsByPhoneAsync(string phone)
        {
            const string sql = """
        SELECT COUNT(1)
        FROM Users
        WHERE Phone = @Phone;
        """
            ;
            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Phone", phone);
            await connection.OpenAsync();
            var count = Convert.ToInt32(await command.ExecuteScalarAsync());
            return count > 0;
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            const string sql = """
        SELECT COUNT(1)
        FROM Users
        WHERE Email = @Email;
        """
            ;

            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);

            command.Parameters.AddWithValue("@Email", email);

            await connection.OpenAsync();

            var count = Convert.ToInt32(await command.ExecuteScalarAsync());

            return count > 0;
        }


        public async Task<int> CreateAsync(User user)
        {
            const string sql = """
        INSERT INTO Users
        (
            Username,
            Email,
            PasswordHash,
            RoleId,
            IsActive,
            Phone,
            FullName,
            CreatedAt
        )
        OUTPUT INSERTED.Id
        VALUES
        (
            @Username,
            @Email,
            @PasswordHash,
            @RoleId,
            @IsActive,
            @Phone,
            @FullName,
            @CreatedAt
        );
        """;
            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);

            command.Parameters.AddWithValue("@Username", user.Username);
            command.Parameters.AddWithValue("@Email", user.Email);
            command.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
            command.Parameters.AddWithValue("@RoleId", user.RoleId);
            command.Parameters.AddWithValue("@IsActive", user.IsActive);
            command.Parameters.AddWithValue(
                "@Phone",
                (object?)user.Phone ?? DBNull.Value
            );
            command.Parameters.AddWithValue("@FullName", user.FullName);
            command.Parameters.AddWithValue("@CreatedAt", user.CreatedAt);

            await connection.OpenAsync();

            var result = await command.ExecuteScalarAsync();

            return Convert.ToInt32(result);
        }

        public async Task<UserAuthInfo?> GetForLoginAsync(string login)
        {
            const string sql = """
        SELECT
            u.Id,
            u.Username,
            u.Email,
            u.PasswordHash,
            u.RoleId,
            u.IsActive,
            u.FullName,
            r.RoleCode
        FROM Users u
        INNER JOIN Roles r
            ON u.RoleId = r.Id
        WHERE (u.Username = @Login
            OR u.Email = @Login);
        """;

            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);

            command.Parameters.AddWithValue("@Login", login);

            await connection.OpenAsync();

            await using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return null;
            }

            return new UserAuthInfo
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Username = reader.GetString(reader.GetOrdinal("Username")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                PasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash")),
                RoleId = reader.GetInt32(reader.GetOrdinal("RoleId")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                FullName = reader.GetString(reader.GetOrdinal("FullName")),
                RoleCode = reader.GetString(reader.GetOrdinal("RoleCode"))
            };
        }

        // Kiểm tra số điện thoại đã được tài khoản KHÁC sử dụng chưa.
        public async Task<bool> ExistsByPhoneForOtherUserAsync(string phone, int userId)
        {
            const string sql = """
                SELECT COUNT(1)
                FROM Users
                WHERE Phone = @Phone
                  AND Id <> @UserId;
                """;

            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Phone", phone);
            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();
            var count = Convert.ToInt32(await command.ExecuteScalarAsync());
            return count > 0;
        }

        public async Task<UserProfileInfo?> GetProfileByIdAsync(int userId)
        {
            const string sql = """
                SELECT
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Phone,
                    u.FullName,
                    u.IsActive,
                    r.RoleCode
                FROM Users u
                INNER JOIN Roles r ON r.Id = u.RoleId
                WHERE u.Id = @UserId;
                """;

            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return null;
            }

            var phoneOrdinal = reader.GetOrdinal("Phone");

            return new UserProfileInfo
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Username = reader.GetString(reader.GetOrdinal("Username")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Phone = reader.IsDBNull(phoneOrdinal)
                    ? null
                    : reader.GetString(phoneOrdinal),
                FullName = reader.GetString(reader.GetOrdinal("FullName")),
                IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                RoleCode = reader.GetString(reader.GetOrdinal("RoleCode"))
            };
        }

        public async Task<(string PasswordHash, bool IsActive)?> GetPasswordInfoByIdAsync(int userId)
        {
            const string sql = """
                SELECT PasswordHash, IsActive
                FROM Users
                WHERE Id = @UserId;
                """;

            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();
            await using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return null;
            }

            return (
                reader.GetString(reader.GetOrdinal("PasswordHash")),
                reader.GetBoolean(reader.GetOrdinal("IsActive")));
        }

        public async Task<bool> UpdatePhoneAsync(int userId, string phone)
        {
            const string sql = """
                UPDATE Users
                SET Phone = @Phone,
                    UpdatedAt = SYSDATETIME()
                WHERE Id = @UserId
                  AND IsActive = 1;
                """;

            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@Phone", phone);
            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> UpdatePasswordHashAsync(int userId, string passwordHash)
        {
            const string sql = """
                UPDATE Users
                SET PasswordHash = @PasswordHash,
                    UpdatedAt = SYSDATETIME()
                WHERE Id = @UserId
                  AND IsActive = 1;
                """;

            await using var connection = _connectionFactory.CreateConnection();
            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@PasswordHash", passwordHash);
            command.Parameters.AddWithValue("@UserId", userId);

            await connection.OpenAsync();
            return await command.ExecuteNonQueryAsync() > 0;
        }

    }
}
