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

    public async Task<List<Client>> GetAllAsync()
    {
        return await _context.Clients.ToListAsync();
    }
}