using RentalRoom.Api.Common.Exceptions;
using RentalRoom.Api.DAO;
using RentalRoom.Api.DTOs.Admin;

namespace RentalRoom.Api.Biz;

public class AdminBiz
{
    private readonly AdminDAO _adminDAO;

    public AdminBiz(AdminDAO adminDAO)
    {
        _adminDAO = adminDAO;
    }

    public Task<AdminDashboardResponse> GetDashboardAsync()
        => _adminDAO.GetDashboardAsync();

    public Task<AdminStatisticsResponse> GetStatisticsAsync()
        => _adminDAO.GetStatisticsAsync();

    public async Task<AdminUserListResponse> GetUsersAsync(
        string? keyword,
        string? roleCode,
        bool? isActive,
        int page,
        int pageSize)
    {
        if (page < 1)
        {
            throw new AppException("INVALID_PAGE", "Số trang phải từ 1 trở lên.", 400);
        }

        if (pageSize < 1 || pageSize > 100)
        {
            throw new AppException("INVALID_PAGE_SIZE", "Kích thước trang phải từ 1 đến 100.", 400);
        }

        if (!string.IsNullOrWhiteSpace(roleCode))
        {
            roleCode = roleCode.Trim().ToUpperInvariant();
            if (roleCode != "TENANT" && roleCode != "LANDLORD")
            {
                throw new AppException("INVALID_ROLE_FILTER", "Vai trò chỉ có thể là TENANT hoặc LANDLORD.", 400);
            }
        }
        else
        {
            roleCode = null;
        }

        var (items, totalCount) = await _adminDAO.GetManagedUsersAsync(
            string.IsNullOrWhiteSpace(keyword) ? null : keyword.Trim(),
            roleCode,
            isActive,
            page,
            pageSize);

        return new AdminUserListResponse
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<AdminUserResponse> GetUserAsync(int userId)
    {
        if (userId <= 0)
        {
            throw new AppException("INVALID_USER_ID", "Mã tài khoản không hợp lệ.", 400);
        }

        var user = await _adminDAO.GetManagedUserByIdAsync(userId);
        if (user == null)
        {
            throw new AppException("USER_NOT_FOUND", "Không tìm thấy tài khoản người thuê hoặc chủ trọ.", 404);
        }

        return user;
    }

    public async Task SetUserStatusAsync(int userId, bool isActive)
    {
        if (userId <= 0)
        {
            throw new AppException("INVALID_USER_ID", "Mã tài khoản không hợp lệ.", 400);
        }

        var user = await _adminDAO.GetManagedUserByIdAsync(userId);
        if (user == null)
        {
            throw new AppException("USER_NOT_FOUND", "Không tìm thấy tài khoản người thuê hoặc chủ trọ.", 404);
        }

        if (user.IsActive == isActive)
        {
            throw new AppException("ACCOUNT_STATUS_UNCHANGED", "Tài khoản đã ở trạng thái được yêu cầu.", 400);
        }

        var updated = await _adminDAO.SetManagedUserStatusAsync(userId, isActive);
        if (!updated)
        {
            throw new AppException("ACCOUNT_STATUS_CONFLICT", "Trạng thái tài khoản đã thay đổi. Hãy tải lại dữ liệu rồi thử lại.", 409);
        }
    }
}
