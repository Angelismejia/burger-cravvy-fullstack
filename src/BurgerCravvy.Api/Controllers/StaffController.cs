using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BurgerCravvy.Api.Controllers;

/// <summary>Panel interno de cocina. Requiere JWT con rol Empleado o Admin.</summary>
[ApiController]
[Route("api/panel")]
[Authorize(Roles = "Empleado,Admin")]
public class StaffController(IStaffService service) : ControllerBase
{
    [HttpGet("pedidos")]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetQueue(CancellationToken ct) =>
        Ok(await service.GetOrderQueueAsync(ct));

    [HttpPatch("pedidos/{code}/estado")]
    public async Task<ActionResult<OrderDto>> ChangeStatus(string code, ChangeOrderStatusRequest request, CancellationToken ct) =>
        Ok(await service.ChangeOrderStatusAsync(code, request, ct));

    /// <summary>Menú completo, incluidos los productos retirados.</summary>
    [HttpGet("productos")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetMenu(CancellationToken ct) =>
        Ok(await service.GetMenuAsync(ct));

    /// <summary>Marca un producto como agotado o disponible.</summary>
    [HttpPatch("productos/{slug}/disponibilidad")]
    public async Task<ActionResult<ProductDto>> SetAvailability(string slug, SetAvailabilityRequest request, CancellationToken ct) =>
        Ok(await service.SetAvailabilityAsync(slug, request, ct));
}
