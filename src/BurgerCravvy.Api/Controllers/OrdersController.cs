using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BurgerCravvy.Api.Controllers;

[ApiController]
[Route("api/pedidos")]
public class OrdersController(IOrderService service) : ControllerBase
{
    /// <summary>Registra un pedido en estado Pendiente. No procesa pagos (demo).</summary>
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        var order = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetByCode), new { code = order.Code }, order);
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<OrderDto>> GetByCode(string code, CancellationToken ct) =>
        Ok(await service.GetByCodeAsync(code, ct));
}
