using Microsoft.EntityFrameworkCore;

namespace Accounting.BackOffice.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
}
