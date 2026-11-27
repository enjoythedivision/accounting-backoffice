using System.ComponentModel.DataAnnotations;
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

    public bool IsActive { get; set; } = true;

    public ICollection<ClientFee> Fees { get; set; }
        = new List<ClientFee>();
}