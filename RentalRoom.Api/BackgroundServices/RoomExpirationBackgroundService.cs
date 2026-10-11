using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RentalRoom.Api.Biz;

namespace RentalRoom.Api.BackgroundServices;

public sealed class RoomExpirationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RoomExpirationBackgroundService> _logger;

    public RoomExpirationBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<RoomExpirationBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Tạo scope để sử dụng RoomBiz đã đăng ký trong DI
                using var scope = _scopeFactory.CreateScope();

                var roomBiz = scope.ServiceProvider
                    .GetRequiredService<RoomBiz>();

                // Tự động chuyển các tin quá hạn sang Expired
                var expiredCount =
                    await roomBiz
                        .ExpireAvailableRoomsNotUpdatedFor30DaysAsync();

                if (expiredCount > 0)
                {
                    _logger.LogInformation(
                        "Đã tự động chuyển {Count} tin phòng sang Expired.",
                        expiredCount);
                }
            }
            catch (Exception ex)
                when (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogError(
                    ex,
                    "Lỗi khi xử lý tin phòng quá hạn.");
            }

            // Chạy lại sau mỗi 24 giờ
            await Task.Delay(
                TimeSpan.FromHours(24),
                stoppingToken);
        }
    }
}