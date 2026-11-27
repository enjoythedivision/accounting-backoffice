using Accounting.BackOffice.Models;
using Accounting.BackOffice.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Accounting.BackOffice.Controllers
{
    public class ClientsController : Controller
    {
        private readonly IClientRepository _clientRepository;

        public ClientsController(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        // GET: ClientsController
        public async Task<ActionResult> Index()
        {
            var clients = await _clientRepository.GetAllAsync();
            return View(clients);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(Client client)
        {
            if (ModelState.IsValid)
            {
                await _clientRepository.AddAsync(client);
                return RedirectToAction("Index");
            }

            return View(client);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(Guid id)
        {
            var client = await _clientRepository.GetClientByIdAsync(id);

            if (client == null)
            {
                return NotFound();
            }

            await _clientRepository.DeleteAsync(client);

            return RedirectToAction("Index");
        }
    }
}
