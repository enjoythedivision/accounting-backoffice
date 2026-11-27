namespace Accounting.BackOffice.Models;

public class ClientFee
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClientId { get; set; }

    public decimal MonthlyAmount { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public Client Client { get; set; } = null!;
}