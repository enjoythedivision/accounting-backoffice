using System.ComponentModel.DataAnnotations;

namespace Accounting.BackOffice.Models;

public class ClientNote
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ClientId { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public Client Client { get; set; } = null!;
}
