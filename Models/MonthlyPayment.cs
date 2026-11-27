using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Accounting.BackOffice.Models;

[Index(nameof(ClientId), nameof(Year), nameof(Month), IsUnique = true)]
public class MonthlyPayment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClientId { get; set; }

    public int Year { get; set; }

    [Range(1, 12)]
    public int Month { get; set; }

    [Precision(6, 2)]
    [Range(0.01, 9999)]
    public decimal Amount { get; set; }

    public DateTime? PaidAt { get; set; }

    public Client Client { get; set; } = null!;
}
