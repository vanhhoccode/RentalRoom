using System.Security.Claims;
using RentalRoom.Api.Common.Exceptions;
using RentalRoom.Api.DAO;
using RentalRoom.Api.DTOs.Favorites;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.Biz;

public class FavoriteBiz
{
    private readonly FavoriteDAO _favoriteDAO;
    private readonly RoomDAO _roomDAO;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FavoriteBiz(
        FavoriteDAO favoriteDAO,
        RoomDAO roomDAO,
        IHttpContextAccessor httpContextAccessor)
    {
        _favoriteDAO = favoriteDAO;
        _roomDAO = roomDAO;
        _httpContextAccessor = httpContextAccessor;
    }

    private int GetCurrentTenantId()
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

    public async Task AddAsync(AddFavoriteRequest request)
    {
        var tenantId = GetCurrentTenantId();

        if (request == null || request.RoomId <= 0)
        {
            throw new AppException(
                "INVALID_ROOM_ID",
                "Mã phòng không hợp lệ.",
                400);
        }

        var room = await _roomDAO.GetByIdAsync(request.RoomId);

        if (room == null)
        {
            throw new AppException(
                "ROOM_NOT_FOUND",
                "Không tìm thấy phòng.",
                404);
        }

        if (room.Status != "Available")
        {
            throw new AppException(
                "ROOM_NOT_AVAILABLE",
                "Phòng hiện không còn khả dụng.",
                400);
        }

        var exists = await _favoriteDAO.ExistsAsync(
            tenantId,
            request.RoomId);

        if (exists)
        {
            throw new AppException(
                "FAVORITE_EXISTS",
                "Phòng này đã được lưu yêu thích.",
                409);
        }

        await _favoriteDAO.InsertAsync(
            new Favorite
            {
                TenantId = tenantId,
                RoomId = request.RoomId
            });
    }

    public async Task RemoveAsync(int roomId)
    {
        var tenantId = GetCurrentTenantId();

        if (roomId <= 0)
        {
            throw new AppException(
                "INVALID_ROOM_ID",
                "Mã phòng không hợp lệ.",
                400);
        }

        var deleted = await _favoriteDAO.DeleteAsync(
            tenantId,
            roomId);

        if (!deleted)
        {
            throw new AppException(
                "FAVORITE_NOT_FOUND",
                "Phòng này chưa được lưu yêu thích.",
                404);
        }
    }

    public async Task<List<FavoriteResponse>> GetMyFavoritesAsync()
    {
        var tenantId = GetCurrentTenantId();

        return await _favoriteDAO.GetByTenantIdAsync(tenantId);
    }
}