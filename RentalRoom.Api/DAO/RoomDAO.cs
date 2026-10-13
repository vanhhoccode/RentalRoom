using Microsoft.Data.SqlClient;
using RentalRoom.Api.Entities;
using RentalRoom.Api.Filters;
using RentalRoom.Api.DTOs;
using RentalRoom.Api.DTOs.Rooms;
using System.Data;

namespace RentalRoom.Api.DAO;

public class RoomDAO
{
    private readonly DbConnectionFactory _connectionFactory;
    public RoomDAO(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }
    public async Task<int> CreateAsync(Room room)
    {
        const string sql = """
        INSERT INTO Rooms
        (
            LandlordId,
            CategoryId,
            Title,
            Description,
            Price,
            Area,
            District,
            Ward,
            AddressDetail,
            Status,
            ViewCount,
            CreatedAt,
            IsDeleted
        )
        OUTPUT INSERTED.Id
        VALUES
        (
            @LandlordId,
            @CategoryId,
            @Title,
            @Description,
            @Price,
            @Area,
            @District,
            @Ward,
            @AddressDetail,
            @Status,
            @ViewCount,
            @CreatedAt,
            @IsDeleted
        );
        """;

        await using var connection =
            _connectionFactory.CreateConnection();
        await using var command =
            new SqlCommand(sql, connection);
        command.Parameters.AddWithValue("@LandlordId", room.LandlordId);
        command.Parameters.AddWithValue("@CategoryId", room.CategoryId);
        command.Parameters.AddWithValue("@Title", room.Title);
        command.Parameters.AddWithValue("@Description", room.Description);
        command.Parameters.AddWithValue("@Price", room.Price);
        command.Parameters.AddWithValue("@Area", room.Area);
        command.Parameters.AddWithValue("@District", room.District);
        command.Parameters.AddWithValue("@Ward", room.Ward);
        command.Parameters.AddWithValue("@AddressDetail", room.AddressDetail);
        command.Parameters.AddWithValue("@Status", room.Status);
        command.Parameters.AddWithValue("@ViewCount", room.ViewCount);
        command.Parameters.AddWithValue("@CreatedAt", room.CreatedAt);
        command.Parameters.AddWithValue("@IsDeleted", room.IsDeleted);
        await connection.OpenAsync();
        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    // Overload dùng trong transaction — nhận connection + transaction từ bên ngoài
    public async Task<int> CreateAsync(
        Room room,
        SqlConnection connection,
        SqlTransaction transaction)
    {
        const string sql = """
        INSERT INTO Rooms
        (
            LandlordId, CategoryId, Title, Description,
            Price, Area, District, Ward, AddressDetail,
            Status, ViewCount, CreatedAt, IsDeleted
        )
        OUTPUT INSERTED.Id
        VALUES
        (
            @LandlordId, @CategoryId, @Title, @Description,
            @Price, @Area, @District, @Ward, @AddressDetail,
            @Status, @ViewCount, @CreatedAt, @IsDeleted
        );
        """;

        await using var command = new SqlCommand(sql, connection, transaction);
        command.Parameters.AddWithValue("@LandlordId", room.LandlordId);
        command.Parameters.AddWithValue("@CategoryId", room.CategoryId);
        command.Parameters.AddWithValue("@Title", room.Title);
        command.Parameters.AddWithValue("@Description", room.Description);
        command.Parameters.AddWithValue("@Price", room.Price);
        command.Parameters.AddWithValue("@Area", room.Area);
        command.Parameters.AddWithValue("@District", room.District);
        command.Parameters.AddWithValue("@Ward", room.Ward);
        command.Parameters.AddWithValue("@AddressDetail", room.AddressDetail);
        command.Parameters.AddWithValue("@Status", room.Status);
        command.Parameters.AddWithValue("@ViewCount", room.ViewCount);
        command.Parameters.AddWithValue("@CreatedAt", room.CreatedAt);
        command.Parameters.AddWithValue("@IsDeleted", room.IsDeleted);
        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    public SqlConnection OpenConnection() => _connectionFactory.CreateConnection();

    public async Task<List<Category>> GetAllCategoryAsync()
    {
        const string sql = """
            SELECT 
                Id, 
                Name, 
                Code 
            FROM Categories;
            """;

        var categories = new List<Category>();

        await using var connection = _connectionFactory.CreateConnection();
        await using var command = new SqlCommand(sql, connection);

        await connection.OpenAsync();

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            categories.Add(new Category
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Name = reader.GetString(reader.GetOrdinal("Name")),
                Code = reader.GetString(reader.GetOrdinal("Code"))
            });
        }

        return categories;
    }

    public async Task<int> ExpireAvailableRoomsNotUpdatedFor30DaysAsync()
    {
        const string sql = """
        UPDATE dbo.Rooms
        SET
            Status = 'Expired',
            UpdatedAt = SYSDATETIME(),
            UpdatedBy = NULL
        WHERE IsDeleted = 0
          AND Status = 'Available'
          AND COALESCE(UpdatedAt, CreatedAt)
              <= DATEADD(DAY, -30, SYSDATETIME());
        """;

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = new SqlCommand(sql, connection);

        return await command.ExecuteNonQueryAsync();
    }

    public async Task<List<Room>> GetByStatusAsync(string status)
    {
        var rooms = new List<Room>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        SELECT
            r.Id,
            r.LandlordId,
            u.FullName AS LandlordName,
            u.Phone AS LandlordPhone,
            r.CategoryId,
            r.Title,
            r.Description,
            r.Price,
            r.Area,
            r.District,
            r.Ward,
            r.AddressDetail,
            r.Status,
            r.RejectReason,
            r.ViewCount,
            r.CreatedAt,
            r.UpdatedAt,
            r.UpdatedBy,
            r.IsDeleted,
            img.Url AS ImageUrl
        FROM Rooms r
        INNER JOIN Users u ON u.Id = r.LandlordId
        OUTER APPLY
        (
            SELECT TOP 1 Url
            FROM RoomImages
            WHERE RoomId = r.Id
            ORDER BY SortOrder ASC, Id ASC
        ) img
        WHERE r.IsDeleted = 0
          AND r.Status = @Status
        ORDER BY r.CreatedAt DESC;
        """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@Status", status);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            rooms.Add(new Room
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                LandlordId = reader.GetInt32(reader.GetOrdinal("LandlordId")),
                LandlordName = reader.IsDBNull(reader.GetOrdinal("LandlordName"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("LandlordName")),
                LandlordPhone = reader.IsDBNull(reader.GetOrdinal("LandlordPhone"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("LandlordPhone")),
                CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                Description = reader.GetString(reader.GetOrdinal("Description")),
                Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                Area = reader.GetDecimal(reader.GetOrdinal("Area")),
                District = reader.GetString(reader.GetOrdinal("District")),
                Ward = reader.GetString(reader.GetOrdinal("Ward")),
                AddressDetail = reader.GetString(reader.GetOrdinal("AddressDetail")),
                Status = reader.GetString(reader.GetOrdinal("Status")),
                RejectReason = reader.IsDBNull(reader.GetOrdinal("RejectReason"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("RejectReason")),
                ViewCount = reader.GetInt32(reader.GetOrdinal("ViewCount")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),

                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),

                UpdatedBy = reader.IsDBNull(reader.GetOrdinal("UpdatedBy"))
                    ? null
                    : reader.GetInt32(reader.GetOrdinal("UpdatedBy")),

                IsDeleted = reader.GetBoolean(
                    reader.GetOrdinal("IsDeleted")),

                ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ImageUrl"))
            });
        }

        return rooms;
    }
    public async Task<List<Amenity>> GetAllAmenityAsync()
    {
        const string sql = """
            SELECT Id, Name
            FROM Amenities
            ORDER BY Id;
            """;

        var amenities = new List<Amenity>();

        await using var connection = _connectionFactory.CreateConnection();
        await using var command = new SqlCommand(sql, connection);

        await connection.OpenAsync();

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

    public async Task<bool> UpdateStatusAsync(
     int roomId,
     string status,
     int updatedBy,
     string? rejectReason = null)
    {
        await using var connection =
            _connectionFactory.CreateConnection();
        await connection.OpenAsync();
        const string sql = """
        UPDATE Rooms
        SET
            Status = @Status,
            RejectReason = CASE
                WHEN @Status = 'Rejected' THEN @RejectReason
                ELSE NULL
            END,
            UpdatedAt = SYSDATETIME(),
            UpdatedBy = @UpdatedBy
        WHERE Id = @Id
          AND IsDeleted = 0
          AND (
                (@Status = 'Available' AND Status IN ('Pending', 'Rented'))
                OR (@Status = 'Rejected' AND Status = 'Pending')
                OR (@Status = 'Rented' AND Status = 'Available')
              );
        """;
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = roomId;
        command.Parameters.Add("@Status", SqlDbType.NVarChar, 20)
            .Value = status;
        command.Parameters.Add("@UpdatedBy", SqlDbType.Int)
            .Value = updatedBy;
        command.Parameters.Add("@RejectReason", SqlDbType.NVarChar, 500)
            .Value = (object?)rejectReason ?? DBNull.Value;
        var rows = await command.ExecuteNonQueryAsync();
        return rows > 0;
    }

    public async Task<(List<Room> Rooms, int TotalCount)> SearchAsync(
        RoomSearchFilter filter)
    {
        const string sql = """
SELECT 
    r.Id, 
    r.LandlordId, 
    r.CategoryId, 
    r.Title, 
    r.Description, 
    r.Price, 
    r.Area, 
    r.District, 
    r.Ward, 
    r.AddressDetail, 
    r.Status, 
    r.ViewCount, 
    r.CreatedAt, 
    r.UpdatedAt, 
    r.UpdatedBy, 
    r.IsDeleted,

    img.Url AS ImageUrl,

    (
        SELECT COUNT(*)
        FROM RoomImages ri
        WHERE ri.RoomId = r.Id
    ) AS ImageCount,

    am.AmenityNames

FROM Rooms r

OUTER APPLY
(
    SELECT TOP 1 Url
    FROM RoomImages
    WHERE RoomId = r.Id
    ORDER BY SortOrder ASC, Id ASC
) img

OUTER APPLY
(
    SELECT STRING_AGG(a.Name, ', ') AS AmenityNames
    FROM RoomAmenities ra
    INNER JOIN Amenities a
        ON ra.AmenityId = a.Id
    WHERE ra.RoomId = r.Id
) am

WHERE r.IsDeleted = 0 
  AND r.Status = 'Available' 
  AND (@Keyword IS NULL OR r.Title LIKE '%' + @Keyword + '%') 
  AND (@CategoryId IS NULL OR r.CategoryId = @CategoryId) 
  AND (@District IS NULL OR r.District = @District) 
  AND (@Ward IS NULL OR r.Ward = @Ward) 
  AND (@MinPrice IS NULL OR r.Price >= @MinPrice) 
  AND (@MaxPrice IS NULL OR r.Price <= @MaxPrice) 

ORDER BY r.CreatedAt DESC 
OFFSET @Offset ROWS 
FETCH NEXT @PageSize ROWS ONLY;
""";

        const string countSql = """
            SELECT COUNT(*)
            FROM Rooms
            WHERE IsDeleted = 0
              AND Status = 'Available'
              AND (@Keyword IS NULL OR Title LIKE '%' + @Keyword + '%')
              AND (@CategoryId IS NULL OR CategoryId = @CategoryId)
              AND (@District IS NULL OR District = @District)
              AND (@Ward IS NULL OR Ward = @Ward)
              AND (@MinPrice IS NULL OR Price >= @MinPrice)
              AND (@MaxPrice IS NULL OR Price <= @MaxPrice);
            """;
        var rooms = new List<Room>();
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Keyword",
            (object?)filter.Keyword ?? DBNull.Value);
        command.Parameters.AddWithValue("@CategoryId",
            (object?)filter.CategoryId ?? DBNull.Value);
        command.Parameters.AddWithValue("@District",
            (object?)filter.District ?? DBNull.Value);
        command.Parameters.AddWithValue("@Ward",
            (object?)filter.Ward ?? DBNull.Value);
        command.Parameters.AddWithValue("@MinPrice",
            (object?)filter.MinPrice ?? DBNull.Value);
        command.Parameters.AddWithValue("@MaxPrice",
            (object?)filter.MaxPrice ?? DBNull.Value);
        var offset = (filter.Page - 1) * filter.PageSize;
        command.Parameters.AddWithValue("@Offset", offset);
        command.Parameters.AddWithValue("@PageSize", filter.PageSize);
        await using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                rooms.Add(new Room
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    LandlordId = reader.GetInt32(reader.GetOrdinal("LandlordId")),
                    CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                    Title = reader.GetString(reader.GetOrdinal("Title")),
                    Description = reader.GetString(reader.GetOrdinal("Description")),
                    Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                    Area = reader.GetDecimal(reader.GetOrdinal("Area")),
                    District = reader.GetString(reader.GetOrdinal("District")),
                    Ward = reader.GetString(reader.GetOrdinal("Ward")),
                    AddressDetail = reader.GetString(reader.GetOrdinal("AddressDetail")),
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    ViewCount = reader.GetInt32(reader.GetOrdinal("ViewCount")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt"))
                        ? null
                        : reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
                    UpdatedBy = reader.IsDBNull(reader.GetOrdinal("UpdatedBy"))
                        ? null
                        : reader.GetInt32(reader.GetOrdinal("UpdatedBy")),
                    IsDeleted = reader.GetBoolean(reader.GetOrdinal("IsDeleted")),
                    ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ImageUrl")),
                    ImageCount = reader.GetInt32(
                    reader.GetOrdinal("ImageCount")),
                    Amenities = reader.IsDBNull(reader.GetOrdinal("AmenityNames"))
                    ? new List<string>()
                    : reader.GetString(reader.GetOrdinal("AmenityNames"))
                        .Split(", ", StringSplitOptions.RemoveEmptyEntries)
                        .ToList(),
                });
            }
        }

        await using var countCommand = new SqlCommand(countSql, connection);
        countCommand.Parameters.AddWithValue("@Keyword",
            (object?)filter.Keyword ?? DBNull.Value);
        countCommand.Parameters.AddWithValue("@CategoryId",
            (object?)filter.CategoryId ?? DBNull.Value);
        countCommand.Parameters.AddWithValue("@District",
            (object?)filter.District ?? DBNull.Value);
        countCommand.Parameters.AddWithValue("@Ward",
            (object?)filter.Ward ?? DBNull.Value);
        countCommand.Parameters.AddWithValue("@MinPrice",
            (object?)filter.MinPrice ?? DBNull.Value);
        countCommand.Parameters.AddWithValue("@MaxPrice",
            (object?)filter.MaxPrice ?? DBNull.Value);
        var totalCount = Convert.ToInt32(
            await countCommand.ExecuteScalarAsync());
        return (rooms, totalCount);
    }

    public async Task<LandlordActionItemsResponse>
    GetLandlordActionItemsAsync(int landlordId)
    {
        const string sql = """
        SELECT
            COALESCE(SUM(
                CASE WHEN Status = 'Pending'
                     THEN 1 ELSE 0 END
            ), 0) AS PendingCount,

            COALESCE(SUM(
                CASE WHEN Status = 'Rejected'
                     THEN 1 ELSE 0 END
            ), 0) AS RejectedCount,

            COALESCE(SUM(
                CASE
                    WHEN Status = 'Available'
                     AND COALESCE(UpdatedAt, CreatedAt)
                         < DATEADD(DAY, -30, SYSDATETIME())
                    THEN 1
                    ELSE 0
                END
            ), 0) AS NeedsStatusReviewCount

        FROM Rooms
        WHERE LandlordId = @LandlordId
          AND IsDeleted = 0;
        """;

        await using var connection =
            _connectionFactory.CreateConnection();

        await connection.OpenAsync();

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@LandlordId", landlordId);

        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
        {
            return new LandlordActionItemsResponse();
        }

        return new LandlordActionItemsResponse
        {
            PendingCount = reader.GetInt32(
                reader.GetOrdinal("PendingCount")),

            RejectedCount = reader.GetInt32(
                reader.GetOrdinal("RejectedCount")),

            NeedsStatusReviewCount = reader.GetInt32(
                reader.GetOrdinal("NeedsStatusReviewCount"))
        };
    }

    public async Task<Room?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                r.Id,
                r.LandlordId,
                u.FullName AS LandlordName,
                u.Phone AS LandlordPhone,
                r.CategoryId,
                c.Name AS CategoryName,
                r.Title,
                r.Description,
                r.Price,
                r.Area,
                r.District,
                r.Ward,
                r.AddressDetail,
                r.Status,
                r.ViewCount,
                r.CreatedAt,
                r.UpdatedAt,
                r.UpdatedBy,
                r.IsDeleted,
                r.RejectReason
            FROM Rooms r
            INNER JOIN Users u
                ON r.LandlordId = u.Id
            INNER JOIN Categories c
                ON r.CategoryId = c.Id
            WHERE r.Id = @Id
              AND r.IsDeleted = 0;
            """;
        await using var connection = _connectionFactory.CreateConnection();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Id", id);
        await connection.OpenAsync();
        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return null;
        }
        var room = new Room
        {
            Id = reader.GetInt32(reader.GetOrdinal("Id")),
            LandlordId = reader.GetInt32(reader.GetOrdinal("LandlordId")),
            LandlordName = reader.IsDBNull(reader.GetOrdinal("LandlordName"))
            ? null
            : reader.GetString(reader.GetOrdinal("LandlordName")),

            LandlordPhone = reader.IsDBNull(reader.GetOrdinal("LandlordPhone"))
            ? null
            : reader.GetString(reader.GetOrdinal("LandlordPhone")),
            CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
            Title = reader.GetString(reader.GetOrdinal("Title")),
            Description = reader.GetString(reader.GetOrdinal("Description")),
            Price = reader.GetDecimal(reader.GetOrdinal("Price")),
            Area = reader.GetDecimal(reader.GetOrdinal("Area")),
            District = reader.GetString(reader.GetOrdinal("District")),
            Ward = reader.GetString(reader.GetOrdinal("Ward")),
            AddressDetail = reader.GetString(reader.GetOrdinal("AddressDetail")),
            Status = reader.GetString(reader.GetOrdinal("Status")),
            //RejectReason = reader.GetString(reader.GetOrdinal("RejectReason")),
            ViewCount = reader.GetInt32(reader.GetOrdinal("ViewCount")),
            CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
            UpdatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt"))
                ? null
                : reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
            UpdatedBy = reader.IsDBNull(reader.GetOrdinal("UpdatedBy"))
                ? null
                : reader.GetInt32(reader.GetOrdinal("UpdatedBy")),
            IsDeleted = reader.GetBoolean(reader.GetOrdinal("IsDeleted")),
            CategoryName = reader.IsDBNull(reader.GetOrdinal("CategoryName"))
            ? null
            : reader.GetString(reader.GetOrdinal("CategoryName")),
        };
        return room;
    }
    public async Task<List<Room>> GetByLandlordIdAsync(int landlordId)
    {
        var rooms = new List<Room>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        SELECT
            r.Id,
            r.LandlordId,
            r.CategoryId,
            r.Title,
            r.Description,
            r.Price,
            r.Area,
            r.District,
            r.Ward,
            r.AddressDetail,
            r.Status,
            r.ViewCount,
            r.CreatedAt,
            r.UpdatedAt,
            r.UpdatedBy,
            r.IsDeleted,
            img.Url AS ImageUrl
        FROM Rooms r
        OUTER APPLY
        (
            SELECT TOP 1 Url
            FROM RoomImages
            WHERE RoomId = r.Id
            ORDER BY SortOrder ASC, Id ASC
        ) img
        WHERE r.LandlordId = @LandlordId
          AND r.IsDeleted = 0
        ORDER BY r.CreatedAt DESC;
        """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@LandlordId", landlordId);

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            rooms.Add(new Room
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                LandlordId = reader.GetInt32(reader.GetOrdinal("LandlordId")),
                CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                Title = reader.GetString(reader.GetOrdinal("Title")),
                Description = reader.GetString(reader.GetOrdinal("Description")),
                Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                Area = reader.GetDecimal(reader.GetOrdinal("Area")),
                District = reader.GetString(reader.GetOrdinal("District")),
                Ward = reader.GetString(reader.GetOrdinal("Ward")),
                AddressDetail = reader.GetString(reader.GetOrdinal("AddressDetail")),
                Status = reader.GetString(reader.GetOrdinal("Status")),
                ViewCount = reader.GetInt32(reader.GetOrdinal("ViewCount")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),

                UpdatedAt = reader.IsDBNull(reader.GetOrdinal("UpdatedAt"))
                    ? null
                    : reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),

                UpdatedBy = reader.IsDBNull(reader.GetOrdinal("UpdatedBy"))
                    ? null
                    : reader.GetInt32(reader.GetOrdinal("UpdatedBy")),

                IsDeleted = reader.GetBoolean(
                    reader.GetOrdinal("IsDeleted")),

                ImageUrl = reader.IsDBNull(reader.GetOrdinal("ImageUrl"))
                    ? null
                    : reader.GetString(reader.GetOrdinal("ImageUrl"))
            });
        }

        return rooms;
    }

    public async Task<bool> SoftDeleteAsync(
    int roomId,
    int landlordId)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        UPDATE Rooms
        SET
            IsDeleted = 1,
            UpdatedAt = SYSDATETIME(),
            UpdatedBy = @LandlordId
        WHERE Id = @Id
          AND LandlordId = @LandlordId
          AND IsDeleted = 0;
        """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@Id", roomId);
        command.Parameters.AddWithValue("@LandlordId", landlordId);

        var rows = await command.ExecuteNonQueryAsync();

        return rows > 0;
    }

    public async Task<bool> UpdateAsync(
    int roomId,
    int landlordId,
    UpdateRoomRequest request)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        UPDATE Rooms
        SET
            CategoryId = @CategoryId,
            Title = @Title,
            Description = @Description,
            Price = @Price,
            Area = @Area,
            District = @District,
            Ward = @Ward,
            AddressDetail = @AddressDetail,
            Status = 'Pending',
            UpdatedAt = SYSDATETIME(),
            UpdatedBy = @UpdatedBy
        WHERE Id = @Id
          AND LandlordId = @LandlordId
          AND IsDeleted = 0;
        """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.AddWithValue("@Id", roomId);
        command.Parameters.AddWithValue("@LandlordId", landlordId);
        command.Parameters.AddWithValue("@CategoryId", request.CategoryId);
        command.Parameters.AddWithValue("@Title", request.Title);
        command.Parameters.AddWithValue("@Description", request.Description);
        command.Parameters.AddWithValue("@Price", request.Price);
        command.Parameters.AddWithValue("@Area", request.Area);
        command.Parameters.AddWithValue("@District", request.District);
        command.Parameters.AddWithValue("@Ward", request.Ward);
        command.Parameters.AddWithValue("@AddressDetail", request.AddressDetail);
        command.Parameters.AddWithValue("@UpdatedBy", landlordId);

        var rows = await command.ExecuteNonQueryAsync();

        return rows > 0;
    }
    public async Task IncrementViewCountAsync(int roomId)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        const string sql = """
        UPDATE Rooms
        SET ViewCount = ViewCount + 1
        WHERE Id = @Id
          AND IsDeleted = 0;
        """;

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Id", roomId);
        await command.ExecuteNonQueryAsync();
    }
}
