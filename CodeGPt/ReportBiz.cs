using System.Security.Claims;
using RentalRoom.Api.Common.Exceptions;
using RentalRoom.Api.DAO;
using RentalRoom.Api.DTOs.Reports;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.Biz;

public class ReportBiz
{
    private readonly ReportDAO _reportDAO;
    private readonly RoomDAO _roomDAO;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ReportBiz(
        ReportDAO reportDAO,
        RoomDAO roomDAO,
        IHttpContextAccessor httpContextAccessor)
    {
        _reportDAO = reportDAO;
        _roomDAO = roomDAO;
        _httpContextAccessor = httpContextAccessor;
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

    public async Task<int> CreateAsync(CreateReportRequest request)
    {
        var tenantId = GetCurrentUserId();

        if (request == null)
        {
            throw new AppException(
                "INVALID_REQUEST",
                "Dữ liệu báo cáo không hợp lệ.",
                400);
        }

        if (request.RoomId <= 0)
        {
            throw new AppException(
                "INVALID_ROOM_ID",
                "Mã phòng không hợp lệ.",
                400);
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new AppException(
                "REASON_REQUIRED",
                "Vui lòng chọn lý do báo cáo.",
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

        var report = new Report
        {
            TenantId = tenantId,
            RoomId = request.RoomId,
            Reason = request.Reason.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            Status = "Pending",
            CreatedAt = DateTime.Now
        };
        var alreadyReported = await _reportDAO.ExistsAsync(
    tenantId,
    request.RoomId);

        if (alreadyReported)
        {
            throw new AppException(
                "REPORT_ALREADY_EXISTS",
                "Bạn đã báo cáo tin đăng này trước đó.",
                400);
        }

        return await _reportDAO.InsertAsync(report);
    }

    public async Task UpdateAsync(
        int reportId,
        UpdateReportRequest request)
    {
        var adminId = GetCurrentUserId();

        if (reportId <= 0)
        {
            throw new AppException(
                "INVALID_REPORT_ID",
                "Mã báo cáo không hợp lệ.",
                400);
        }

        if (request == null ||
            string.IsNullOrWhiteSpace(request.Status))
        {
            throw new AppException(
                "INVALID_STATUS",
                "Trạng thái xử lý không hợp lệ.",
                400);
        }

        var status = request.Status.Trim();

        if (status != "Resolved" && status != "Rejected")
        {
            throw new AppException(
                "INVALID_STATUS",
                "Trạng thái chỉ có thể là Resolved hoặc Rejected.",
                400);
        }

        var report = await _reportDAO.GetByIdAsync(reportId);

        if (report == null)
        {
            throw new AppException(
                "REPORT_NOT_FOUND",
                "Không tìm thấy báo cáo.",
                404);
        }

        if (report.Status != "Pending")
        {
            throw new AppException(
                "REPORT_ALREADY_PROCESSED",
                "Báo cáo này đã được xử lý.",
                400);
        }

        await _reportDAO.UpdateStatusAsync(
            reportId,
            status,
            adminId);
    }
    public async Task<List<ReportResponse>> GetListAsync(string? status)
    {
        return await _reportDAO.GetListAsync(status);
    }
}