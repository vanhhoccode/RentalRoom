using RentalRoom.Api.DTOs.Admin;
using RentalRoom.Api.Common.Exceptions;
using RentalRoom.Api.DAO;
using RentalRoom.Api.DTOs;
using RentalRoom.Api.DTOs.Category;
using RentalRoom.Api.DTOs.Rooms;
using RentalRoom.Api.Entities;
using RentalRoom.Api.Filters;
using System.Security.Claims;
using System.Transactions;

//Review: Bổ sung thêm 1 số tiện ích vào cho phòng.
namespace RentalRoom.Api.Biz;
public class RoomBiz
{
    private readonly RoomDAO _roomDAO;
    private readonly RoomImageDAO _roomImageDAO;
    private readonly RoomAmenityDAO _roomAmenityDAO;
    private readonly ReportDAO _reportDAO;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public RoomBiz(
    RoomDAO roomDAO,
    RoomImageDAO roomImageDAO,
    RoomAmenityDAO roomAmenityDAO,
    IHttpContextAccessor httpContextAccessor,
    ReportDAO reportDAO)
    {
        _roomDAO = roomDAO;
        _roomImageDAO = roomImageDAO;
        _roomAmenityDAO = roomAmenityDAO;
        _httpContextAccessor = httpContextAccessor;
        _reportDAO = reportDAO;
    }
    public async Task<CreateRoomResponse> CreateRoomAsync(
    CreateRoomRequest request)
    {
        if (request == null)
        {
            throw new AppException(
                "INVALID_REQUEST",
                "Dữ liệu tạo tin không hợp lệ.",
                400);
        }
        // ==============================
        // 1. LẤY LANDLORD ID TỪ JWT
        // ==============================
        var userIdClaim =
            _httpContextAccessor.HttpContext?
                .User
                .FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            throw new AppException(
                "UNAUTHORIZED",
                "Bạn chưa đăng nhập.",
                401);
        }
        var landlordId = int.Parse(userIdClaim.Value);

        // ==============================
        // 2. VALIDATE DỮ LIỆU
        // ==============================
        if (request.CategoryId <= 0)
            throw new AppException("INVALID_CATEGORY", "Danh mục phòng không hợp lệ.", 400);

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new AppException("TITLE_REQUIRED", "Tiêu đề tin đăng không được để trống.", 400);

        if (string.IsNullOrWhiteSpace(request.Description))
            throw new AppException("DESCRIPTION_REQUIRED", "Mô tả phòng không được để trống.", 400);

        if (request.Price <= 0)
            throw new AppException("INVALID_PRICE", "Giá phòng phải lớn hơn 0.", 400);

        if (request.Area <= 0)
            throw new AppException("INVALID_AREA", "Diện tích phòng phải lớn hơn 0.", 400);

        if (request.Images == null || request.Images.Count == 0)
            throw new AppException("IMAGE_REQUIRED", "Tin đăng phải có ít nhất một hình ảnh.", 400);

        // [FIX BUG 3] Giới hạn số lượng và kích thước ảnh
        const int maxImages = 10;
        const long maxImageSizeBytes = 5 * 1024 * 1024; // 5 MB
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        if (request.Images.Count > maxImages)
            throw new AppException(
                "TOO_MANY_IMAGES",
                $"Tối đa {maxImages} ảnh cho mỗi tin đăng.",
                400);

        foreach (var img in request.Images)
        {
            var ext = Path.GetExtension(img.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                throw new AppException(
                    "INVALID_IMAGE_TYPE",
                    "Chỉ cho phép tải ảnh JPG, JPEG, PNG hoặc WEBP.",
                    400);

            if (img.Length > maxImageSizeBytes)
                throw new AppException(
                    "IMAGE_TOO_LARGE",
                    $"Ảnh '{img.FileName}' vượt quá giới hạn 5 MB.",
                    400);
        }

        // ==============================
        // 3. TẠO PHÒNG TRONG TRANSACTION
        // ==============================
        var room = new Room
        {
            LandlordId = landlordId,
            CategoryId = request.CategoryId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Price = request.Price,
            Area = request.Area,
            District = request.District.Trim(),
            Ward = request.Ward.Trim(),
            AddressDetail = request.AddressDetail.Trim(),
            Status = "Pending",
            ViewCount = 0,
            CreatedAt = DateTime.Now,
            UpdatedAt = null,
            UpdatedBy = null,
            IsDeleted = false
        };

        var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        string? roomFolder = null;
        var imageUrls = new List<string>();

        // [FIX BUG 2] Bọc toàn bộ thao tác DB trong transaction
        await using var connection = _roomDAO.OpenConnection();
        await connection.OpenAsync();
        await using var transaction = connection.BeginTransaction();
        try
        {
            // 3a. Insert Room
            var roomId = await _roomDAO.CreateAsync(room, connection, transaction);

            // 3b. Insert Amenities
            foreach (var amenityId in request.AmenityIds)
            {
                await _roomAmenityDAO.InsertAsync(
                    new RoomAmenity { RoomId = roomId, AmenityId = amenityId },
                    connection, transaction);
            }

            // 3c. Lưu file ảnh vào disk
            roomFolder = Path.Combine(webRootPath, "uploads", "rooms", roomId.ToString());
            Directory.CreateDirectory(roomFolder);
            var sortOrder = 0;

            foreach (var image in request.Images)
            {
                if (image.Length <= 0) continue;

                var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
                var fileName = $"{Guid.NewGuid():N}{extension}";
                var filePath = Path.Combine(roomFolder, fileName);

                await using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);

                var imageUrl = $"/uploads/rooms/{roomId}/{fileName}";
                await _roomImageDAO.InsertAsync(
                    new RoomImage
                    {
                        RoomId = roomId,
                        Url = imageUrl,
                        IsVideo = false,
                        SortOrder = sortOrder++
                    },
                    connection, transaction);

                imageUrls.Add(imageUrl);
            }

            // Tất cả OK → commit
            await transaction.CommitAsync();

            return new CreateRoomResponse
            {
                RoomId = roomId,
                Status = room.Status,
                ImageUrls = imageUrls
            };
        }
        catch
        {
            // [FIX BUG 2] Rollback DB
            await transaction.RollbackAsync();

            // [FIX BUG 4] Dọn thư mục ảnh nếu đã tạo
            if (roomFolder != null && Directory.Exists(roomFolder))
            {
                Directory.Delete(roomFolder, recursive: true);
            }

            throw; // ré-throw để GlobalExceptionHandler xử lý
        }
    }

    public async Task<LandlordActionItemsResponse>
    GetMyActionItemsAsync()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?
            .User
            .FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null ||
            !int.TryParse(userIdClaim.Value, out var landlordId))
        {
            throw new AppException(
                "UNAUTHORIZED",
                "Bạn chưa đăng nhập.",
                401);
        }

        return await _roomDAO.GetLandlordActionItemsAsync(landlordId);
    }

    public async Task UpdateRoomAsync(
     int roomId,
     UpdateRoomRequest request)
    {
        // 1. Lấy landlordId từ JWT
        var userIdClaim = _httpContextAccessor.HttpContext?
            .User
            .FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new AppException(
                "UNAUTHORIZED",
                "Bạn chưa đăng nhập.",
                401);
        }

        var landlordId = int.Parse(userIdClaim.Value);

        // 2. Validate roomId
        if (roomId <= 0)
        {
            throw new AppException(
                "INVALID_ROOM_ID",
                "Mã phòng không hợp lệ.",
                400);
        }

        // 3. Validate request
        if (request == null)
        {
            throw new AppException(
                "INVALID_REQUEST",
                "Dữ liệu cập nhật không hợp lệ.",
                400);
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new AppException(
                "TITLE_REQUIRED",
                "Tiêu đề không được để trống.",
                400);
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            throw new AppException(
                "DESCRIPTION_REQUIRED",
                "Mô tả không được để trống.",
                400);
        }

        if (request.Price <= 0)
        {
            throw new AppException(
                "INVALID_PRICE",
                "Giá phòng phải lớn hơn 0.",
                400);
        }

        if (request.Area <= 0)
        {
            throw new AppException(
                "INVALID_AREA",
                "Diện tích phải lớn hơn 0.",
                400);
        }

        // 4. Lấy phòng
        var room = await _roomDAO.GetByIdAsync(roomId);

        if (room == null)
        {
            throw new AppException(
                "ROOM_NOT_FOUND",
                "Không tìm thấy tin đăng.",
                404);
        }

        // 5. Kiểm tra quyền sở hữu
        if (room.LandlordId != landlordId)
        {
            throw new AppException(
                "FORBIDDEN",
                "Bạn không có quyền sửa tin đăng này.",
                403);
        }

        // 6. Phòng đã cho thuê thì không cho sửa
        if (room.Status == "Rented")
        {
            throw new AppException(
                "ROOM_ALREADY_RENTED",
                "Phòng đã được cho thuê, không thể chỉnh sửa tin đăng.",
                400);
        }

        using (var scope = new TransactionScope(
            TransactionScopeAsyncFlowOption.Enabled))
        {
            // =========================================================
            // 7. Cập nhật thông tin phòng
            //    DAO phải set Status = 'Pending'
            // =========================================================

            var updated = await _roomDAO.UpdateAsync(
                roomId,
                landlordId,
                request);

            if (!updated)
            {
                throw new AppException(
                    "UPDATE_FAILED",
                    "Không thể cập nhật tin đăng.",
                    500);
            }

            // =========================================================
            // 8. Cập nhật tiện ích
            // =========================================================

            await _roomAmenityDAO.DeleteByRoomIdAsync(roomId);

            foreach (var amenityId in request.AmenityIds.Distinct())
            {
                await _roomAmenityDAO.InsertAsync(
                    new RoomAmenity
                    {
                        RoomId = roomId,
                        AmenityId = amenityId
                    });
            }

            // =========================================================
            // 9. Nếu ReplaceImages = true thì thay toàn bộ ảnh
            // =========================================================

            if (request.ReplaceImages)
            {
                // Xóa các record ảnh cũ trong DB
                await _roomImageDAO.DeleteByRoomIdAsync(roomId);

                // Nếu có ảnh mới thì thêm vào
                if (request.Images != null && request.Images.Count > 0)
                {
                    int sortOrder = 0;

                    foreach (var image in request.Images)
                    {
                        if (image == null || image.Length == 0)
                        {
                            continue;
                        }

                        var extension = Path.GetExtension(image.FileName);

                        var fileName =
                            $"{Guid.NewGuid()}{extension}";

                        // Dùng working directory, không cần _environment
                        var folderPath = Path.Combine(
                            Directory.GetCurrentDirectory(),
                            "wwwroot",
                            "uploads",
                            "rooms",
                            roomId.ToString());

                        Directory.CreateDirectory(folderPath);

                        var filePath = Path.Combine(
                            folderPath,
                            fileName);

                        using (var stream = new FileStream(
                            filePath,
                            FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }

                        var imageUrl =
                            $"/uploads/rooms/{roomId}/{fileName}";

                        await _roomImageDAO.InsertAsync(
                            new RoomImage
                            {
                                RoomId = roomId,
                                Url = imageUrl,
                                IsVideo = false,
                                SortOrder = sortOrder
                            });

                        sortOrder++;
                    }
                }
            }

            // =========================================================
            // 10. Commit transaction
            // =========================================================

            scope.Complete();
        }
    }

    public async Task<List<RoomResponse>> GetMyRoomsAsync()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?
            .User
            .FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new AppException(
                "UNAUTHORIZED",
                "Bạn chưa đăng nhập.",
                401);
        }

        var landlordId = int.Parse(userIdClaim.Value);

        var rooms = await _roomDAO.GetByLandlordIdAsync(landlordId);

        return rooms.Select(room => new RoomResponse
        {
            Id = room.Id,
            CategoryId = room.CategoryId,
            Title = room.Title,
            Description = room.Description,
            Price = room.Price,
            Area = room.Area,
            District = room.District,
            Ward = room.Ward,
            AddressDetail = room.AddressDetail,
            Status = room.Status,
            ViewCount = room.ViewCount,
            CreatedAt = room.CreatedAt,
            ImageUrl = room.ImageUrl,
            RejectReason = room.RejectReason
        }).ToList();
    }

    public async Task<RoomSearchResponse> SearchAsync(
    RoomSearchFilter filter)
    {
        if (filter.Page < 1)
        {
            filter.Page = 1;
        }

        if (filter.PageSize < 1)
        {
            filter.PageSize = 10;
        }

        if (filter.PageSize > 100)
        {
            filter.PageSize = 100;
        }

        if (filter.MinPrice.HasValue &&
            filter.MaxPrice.HasValue &&
            filter.MinPrice > filter.MaxPrice)
        {
            throw new ArgumentException(
                "MinPrice cannot be greater than MaxPrice.");
        }

        var result = await _roomDAO.SearchAsync(filter);

        var response = new RoomSearchResponse
        {
            TotalCount = result.TotalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };

        response.Rooms = result.Rooms
            .Select(room => new RoomResponse
            {
                Id = room.Id,
                CategoryId = room.CategoryId,
                Title = room.Title,
                Description = room.Description,
                Price = room.Price,
                Area = room.Area,
                District = room.District,
                Ward = room.Ward,
                AddressDetail = room.AddressDetail,
                Status = room.Status,
                ViewCount = room.ViewCount,
                CreatedAt = room.CreatedAt,
                ImageUrl = room.ImageUrl,
                Amenities = room.Amenities,
                ImageCount = room.ImageCount,
            })
            .ToList();

        return response;
    }

    public async Task<List<CategoryResponse>> GetCategories()
    {
        var categories = await _roomDAO.GetAllCategoryAsync();
        if (categories == null || categories.Count == 0)
            return new List<CategoryResponse>();

        var response = new List<CategoryResponse>();
        response = categories
           .Select(category => new CategoryResponse
           {
               Id = category.Id,
               Name = category.Name
           })
           .ToList();

        return response;
    }

    public async Task DeleteRoomAsync(int roomId)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?
            .User
            .FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new AppException(
                "UNAUTHORIZED",
                "Bạn chưa đăng nhập.",
                401);
        }

        var landlordId = int.Parse(userIdClaim.Value);

        if (roomId <= 0)
        {
            throw new AppException(
                "INVALID_ROOM_ID",
                "Mã phòng không hợp lệ.",
                400);
        }

        var room = await _roomDAO.GetByIdAsync(roomId);

        if (room == null)
        {
            throw new AppException(
                "ROOM_NOT_FOUND",
                "Không tìm thấy tin đăng.",
                404);
        }

        if (room.LandlordId != landlordId)
        {
            throw new AppException(
                "FORBIDDEN",
                "Bạn không có quyền xóa tin đăng này.",
                403);
        }

        var deleted = await _roomDAO.SoftDeleteAsync(
            roomId,
            landlordId);

        if (!deleted)
        {
            throw new AppException(
                "DELETE_FAILED",
                "Không thể xóa tin đăng.",
                500);
        }
    }

    public async Task UpdateRoomStatusAsync(
    int roomId,
    string status)
    {
        // 1. Kiểm tra đăng nhập
        var userIdClaim = _httpContextAccessor.HttpContext?
            .User
            .FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new AppException(
                "UNAUTHORIZED",
                "Bạn chưa đăng nhập.",
                401);
        }

        var landlordId = int.Parse(userIdClaim.Value);

        // 2. Kiểm tra roomId
        if (roomId <= 0)
        {
            throw new AppException(
                "INVALID_ROOM_ID",
                "Mã phòng không hợp lệ.",
                400);
        }

        // 3. Kiểm tra status
        if (string.IsNullOrWhiteSpace(status))
        {
            throw new AppException(
                "STATUS_REQUIRED",
                "Trạng thái không được để trống.",
                400);
        }

        status = status.Trim();

        // 4. Chỉ cho phép landlord cập nhật 2 trạng thái này
        if (status != "Available" && status != "Rented")
        {
            throw new AppException(
                "INVALID_STATUS",
                "Trạng thái không hợp lệ.",
                400);
        }

        // 5. Lấy phòng
        var room = await _roomDAO.GetByIdAsync(roomId);

        if (room == null)
        {
            throw new AppException(
                "ROOM_NOT_FOUND",
                "Không tìm thấy phòng.",
                404);
        }

        // 6. Kiểm tra quyền sở hữu
        if (room.LandlordId != landlordId)
        {
            throw new AppException(
                "FORBIDDEN",
                "Bạn không có quyền cập nhật phòng này.",
                403);
        }

        // 7. Không cho cập nhật tin chưa được duyệt
        // 7. Chỉ cho phép chuyển trạng thái hợp lệ
        var canTransition =
            (room.Status == "Available" && status == "Rented") ||
            (room.Status == "Rented" && status == "Available");

        if (!canTransition)
        {
            throw new AppException(
                "INVALID_STATUS_TRANSITION",
                "Chỉ được chuyển phòng từ Còn trống sang Đã cho thuê "
                + "hoặc từ Đã cho thuê sang Còn trống.",
                400);
        }

        // 8. Cập nhật trạng thái
        var updated = await _roomDAO.UpdateStatusAsync(
            roomId,
            status,
            landlordId);

        if (!updated)
        {
            throw new AppException(
                "INVALID_STATUS_TRANSITION",
                "Trạng thái phòng đã thay đổi hoặc không còn hợp lệ.",
                400);
        }
    }
    public async Task ApproveRoomAsync(int roomId)
    {
        var adminId = GetCurrentUserId();

        if (roomId <= 0)
        {
            throw new AppException(
                "INVALID_ROOM_ID",
                "Mã phòng không hợp lệ.",
                400);
        }

        var room = await _roomDAO.GetByIdAsync(roomId);

        if (room == null)
        {
            throw new AppException(
                "ROOM_NOT_FOUND",
                "Không tìm thấy tin đăng.",
                404);
        }

        if (room.Status != "Pending")
        {
            throw new AppException(
                "ROOM_NOT_PENDING",
                "Tin đăng không ở trạng thái chờ duyệt.",
                400);
        }

        var updated = await _roomDAO.UpdateStatusAsync(
            roomId,
            "Available",
            adminId);

        if (!updated)
        {
            throw new AppException(
                "ROOM_STATUS_CHANGED",
                "Trạng thái tin đăng đã thay đổi. Hãy tải lại danh sách.",
                409);
        }
    }
    public async Task RejectRoomAsync(int roomId, string rejectReason)
    {
        var adminId = GetCurrentUserId();

        if (roomId <= 0)
        {
            throw new AppException(
                "INVALID_ROOM_ID",
                "Mã phòng không hợp lệ.",
                400);
        }

        if (string.IsNullOrWhiteSpace(rejectReason))
        {
            throw new AppException(
                "REJECT_REASON_REQUIRED",
                "Vui lòng nhập lý do từ chối.",
                400);
        }

        var room = await _roomDAO.GetByIdAsync(roomId);

        if (room == null)
        {
            throw new AppException(
                "ROOM_NOT_FOUND",
                "Không tìm thấy tin đăng.",
                404);
        }

        if (room.Status != "Pending")
        {
            throw new AppException(
                "ROOM_NOT_PENDING",
                "Tin đăng không ở trạng thái chờ duyệt.",
                400);
        }

        var updated = await _roomDAO.UpdateStatusAsync(
            roomId,
            "Rejected",
            adminId,
            rejectReason);

        if (!updated)
        {
            throw new AppException(
                "ROOM_STATUS_CHANGED",
                "Trạng thái tin đăng đã thay đổi. Hãy tải lại danh sách.",
                409);
        }

        // Giữ nguyên ảnh để chủ trọ có thể chỉnh sửa tin bị từ chối và gửi duyệt lại.
    }
    // Danh sách Pending trả thêm thông tin chủ trọ để Admin biết ai đã đăng tin.
    public async Task<List<AdminPendingRoomResponse>> GetPendingRoomsAsync()
    {
        var rooms = await _roomDAO.GetByStatusAsync("Pending");
        return rooms.Select(room => new AdminPendingRoomResponse
        {
            Id = room.Id,
            LandlordId = room.LandlordId,
            LandlordName = room.LandlordName,
            LandlordPhone = room.LandlordPhone,
            CategoryId = room.CategoryId,
            Title = room.Title,
            Description = room.Description,
            Price = room.Price,
            Area = room.Area,
            District = room.District,
            Ward = room.Ward,
            AddressDetail = room.AddressDetail,
            Status = room.Status,
            ViewCount = room.ViewCount,
            CreatedAt = room.CreatedAt,
            ImageUrl = room.ImageUrl,
            RejectReason = room.RejectReason
        }).ToList();
    }
    private int GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?
            .User
            .FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new AppException(
                "UNAUTHORIZED",
                "Bạn chưa đăng nhập.",
                401);
        }

        return int.Parse(userIdClaim.Value);
    }

    public Task<int> ExpireAvailableRoomsNotUpdatedFor30DaysAsync()
    {
        return _roomDAO.ExpireAvailableRoomsNotUpdatedFor30DaysAsync();
    }

    public async Task<RoomDetailResponse?> GetRoomByIdAsync(int id)
    {
        // 1. Lấy phòng
        var room = await _roomDAO.GetByIdAsync(id);

        if (room == null)
        {
            return null;
        }

        // 2. Phòng đã xóa
        if (room.IsDeleted)
        {
            return null;
        }

        // 3. User hiện tại
        var user = _httpContextAccessor.HttpContext?.User;

        var isTenant = user?.IsInRole("TENANT") == true;
        var isAdmin = user?.IsInRole("ADMIN") == true;

        var userIdClaim = user?
            .FindFirst(ClaimTypes.NameIdentifier);

        int.TryParse(
            userIdClaim?.Value,
            out var currentUserId);

        var isOwner = room.LandlordId == currentUserId;

        // 4. Pending / Rejected:
        // chỉ Admin hoặc chính chủ được xem
        if (room.Status == "Pending" || room.Status == "Rejected")
        {
            if (!isAdmin && !isOwner)
            {
                return null;
            }
        }
        else if (room.Status != "Available" &&
                 room.Status != "Rented")
        {
            return null;
        }

        // 5. Lấy toàn bộ ảnh
        var images = await _roomImageDAO.GetByRoomIdAsync(id);

        // 6. Lấy toàn bộ tiện ích
        var amenities = await _roomAmenityDAO.GetByRoomIdAsync(id);

        // 7. Kiểm tra Tenant hiện tại đã report room này chưa
        var hasReported = false;

        if (isTenant)
        {
            hasReported = await _reportDAO.ExistsAsync(
                currentUserId,
                id);
        }

        // 8. Chỉ Tenant + Available mới được nhận số điện thoại
        var canContact =
            isTenant &&
            room.Status == "Available";

        // 9. Trả về detail
        return new RoomDetailResponse
        {
            Id = room.Id,

            CategoryId = room.CategoryId,
            CategoryName = room.CategoryName,

            Title = room.Title,
            Description = room.Description,

            Price = room.Price,
            Area = room.Area,

            District = room.District,
            Ward = room.Ward,
            AddressDetail = room.AddressDetail,

            Status = room.Status,
            RejectReason = room.RejectReason,
            ViewCount = room.ViewCount,
            CreatedAt = room.CreatedAt,

            Images = images
                .Select(x => x.Url)
                .ToList(),

            Amenities = amenities,

            LandlordName = room.LandlordName,

            LandlordPhone = canContact
                ? room.LandlordPhone
                : null,

            HasReported = hasReported
        };
    }
}