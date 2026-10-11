namespace RentalRoom.Api.DTOs
{
    public class LandlordActionItemsResponse
    {
        public int PendingCount { get; set; }

        public int RejectedCount { get; set; }

        public int NeedsStatusReviewCount { get; set; }
    }
}
