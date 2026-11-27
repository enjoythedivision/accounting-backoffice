using Accounting.BackOffice.Models;

namespace Accounting.BackOffice.Repositories;

public interface IClientRepository
{
    Task<List<Client>> GetAllAsync();
    Task AddAsync(Client client);
    Task UpdateAsync(Client client);
    Task DeleteAsync(Client client);
    Task<Client?> GetClientByIdAsync(Guid clientId);
}
