using Accounting.BackOffice.Models;

namespace Accounting.BackOffice.Repositories;

public interface IClientRepository
{
    Task<List<Client>> GetAllAsync();
}