using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalRoom.Api.Biz;
using RentalRoom.Api.DTOs.Reports;

namespace RentalRoom.Api.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportController : ControllerBase
{
    private readonly ReportBiz _reportBiz;

    public ReportController(ReportBiz reportBiz)
    {
        _reportBiz = reportBiz;
    }

    [Authorize(Roles = "TENANT")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateReportRequest request)
    {
        var reportId = await _reportBiz.CreateAsync(request);
        return StatusCode(201, new
        {
            success = true,
            reportId,
            message = "Đã gửi báo cáo."
        });
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateReportRequest request)
    {
        await _reportBiz.UpdateAsync(id, request);
        return Ok(new
        {
            success = true,
            message = "Đã xử lý báo cáo."
        });
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<IActionResult> GetList(
    [FromQuery] string? status)
    {
        var reports = await _reportBiz.GetListAsync(status);
        return Ok(reports);
    }
}