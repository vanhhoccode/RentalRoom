using RentalRoom.Api.DAO;
using RentalRoom.Api.Entities;

namespace RentalRoom.Api.Biz;

public class AmenityBiz
{
    private readonly AmenityDAO _amenityDAO;

    public AmenityBiz(AmenityDAO amenityDAO)
    {
        _amenityDAO = amenityDAO;
    }

    public async Task<List<Amenity>> GetAllAsync()
    {
        return await _amenityDAO.GetAllAsync();
    }
}