using Accounting.BackOffice.Data;
using Accounting.BackOffice.Models;
using Microsoft.EntityFrameworkCore;

namespace Accounting.BackOffice.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly ApplicationDbContext _context;

    public ClientRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Client client)
    {
        _context.Clients.Add(client);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Client client)
    {
        var existingClient = await GetClientByIdAsync(client.Id);

        if (existingClient == null)
        {
            return;
        }

        existingClient.IsActive = false;
        await _context.SaveChangesAsync();
    }

    public async Task<List<Client>> GetAllAsync()
    {
        return await _context.Clients.ToListAsync();
    }

    public async Task<Client?> GetClientByIdAsync(Guid clientId)
    {
        return await _context.Clients.FirstOrDefaultAsync(c => c.Id == clientId);
    }

    public async Task UpdateAsync(Client client)
    {
        var clientToUpdate = await _context.Clients.FirstOrDefaultAsync(c => c.Id == client.Id);
        if (clientToUpdate == null)
        {
            return;
        }
        clientToUpdate.FullName = client.FullName;
        clientToUpdate.Phone = client.Phone;
        clientToUpdate.Email = client.Email;
        clientToUpdate.MonthlyFee = client.MonthlyFee;
        await _context.SaveChangesAsync();
    }
}
