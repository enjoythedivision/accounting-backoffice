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

        public async Task<IActionResult> Details(Guid id)
        {
            var client = await _clientRepository.GetClientByIdAsync(id);
            if (client is null)
            {
                return NotFound();
            }

            return View(client);

        }

        [HttpGet]
        public async Task<IActionResult> Edit(Guid id)
        {
            var clientToEdit = await _clientRepository.GetClientByIdAsync(id);
            if (clientToEdit is null)
            {
                return NotFound();
            }

            return View(clientToEdit);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(
            [Bind("Id,FullName,Phone,Email,MonthlyFee")] Client client)
        {
            if (!ModelState.IsValid)
            {
                return View(client);
            }

            var clientToEdit = await _clientRepository.GetClientByIdAsync(client.Id);

            if (clientToEdit is null)
            {
                return NotFound();
            }

            await _clientRepository.UpdateAsync(client);

            return RedirectToAction("Index");
        }
    }
}
