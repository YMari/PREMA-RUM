using Microsoft.EntityFrameworkCore;
using PreEnrollmentMgmt.Core.Entities;
using PreEnrollmentMgmt.Core.Repositories;
using PreEnrollmentMgmt.DataAccess;

namespace PreEnrollmentMgmt.Application.Repositories;

public class SemesterOfferRepository : ISemesterOfferRepository
{
    private readonly PremaRumDbContext _context;

    public SemesterOfferRepository(PremaRumDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SemesterOffer>> GetByIdList(int[] ids)
    {
        return await GetCompleteSemesterOfferQueryable()
            .Where(so => ids.Contains(so.Id))
            .ToListAsync();
    }

    private IQueryable<SemesterOffer> GetCompleteSemesterOfferQueryable()
    {
        return _context
            .SemesterOffers
            .Include(so => so.Semester).ThenInclude(s => s.Term)
            .Include(so => so.Course)
            .Include(so => so.Professors)
            .Include(so => so.TimeSlots).ThenInclude(ts => ts.WeekDay);
    }
}