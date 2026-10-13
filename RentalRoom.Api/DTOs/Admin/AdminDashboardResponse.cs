namespace RentalRoom.Api.DTOs.Admin;

public class AdminDashboardResponse
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int DisabledUsers { get; set; }
    public int TotalTenants { get; set; }
    public int TotalLandlords { get; set; }

    public int TotalRooms { get; set; }
    public int PendingRooms { get; set; }
    public int AvailableRooms { get; set; }
    public int RentedRooms { get; set; }
    public int RejectedRooms { get; set; }

    public int TotalReports { get; set; }
    public int PendingReports { get; set; }
    public int ResolvedReports { get; set; }
    public int RejectedReports { get; set; }
}
