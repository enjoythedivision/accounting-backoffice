using Accounting.BackOffice.Models;
using Microsoft.EntityFrameworkCore;
namespace Accounting.BackOffice.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients { get; set; }
    public DbSet<ClientFee> ClientFees { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Client>()
            .Property(c => c.FullName)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<ClientFee>()
            .Property(f => f.MonthlyAmount)
            .HasPrecision(12, 2);

        modelBuilder.Entity<ClientFee>()
            .HasIndex(f => new { f.ClientId, f.EffectiveFrom })
            .IsUnique();
    }
}