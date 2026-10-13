namespace RentalRoom.Api.DTOs.Admin;

public class AdminStatisticsResponse
{
    public List<CountByStatusResponse> RoomsByStatus { get; set; } = new();
    public List<CountByStatusResponse> ReportsByStatus { get; set; } = new();
    public List<CountByRoleResponse> UsersByRole { get; set; } = new();
}

public class CountByStatusResponse
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class CountByRoleResponse
{
    public string RoleCode { get; set; } = string.Empty;
    public int Count { get; set; }
}
