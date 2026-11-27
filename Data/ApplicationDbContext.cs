using Accounting.BackOffice.Models;
using Microsoft.EntityFrameworkCore;

namespace Accounting.BackOffice.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Client> Clients { get; set; }
    public DbSet<MonthlyPayment> MonthlyPayments { get; set; }
    public DbSet<ClientNote> ClientNotes { get; set; }
}
