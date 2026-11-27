using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Accounting.BackOffice.Models;

[Index(nameof(ClientId), nameof(EffectiveFrom), IsUnique = true)]
public class ClientFee
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClientId { get; set; }

    [Precision(12, 2)]
    [Range(0.01, 9999.00)]
    public decimal MonthlyAmount { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public Client Client { get; set; } = null!;
}