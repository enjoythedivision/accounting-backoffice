using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Accounting.BackOffice.Models;

public class Client
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [StringLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Phone]
    [StringLength(30)]
    public string? Phone { get; set; }

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; set; }

    [Precision(6, 2)]
    [Range(0.01, 9999)]
    public decimal MonthlyFee { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<MonthlyPayment> Payments { get; set; }
        = new List<MonthlyPayment>();

    public ICollection<ClientNote> Notes { get; set; }
        = new List<ClientNote>();
}
