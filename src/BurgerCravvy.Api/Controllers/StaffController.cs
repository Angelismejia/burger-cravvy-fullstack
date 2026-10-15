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

    [HttpGet("productos")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetMenu(CancellationToken ct) =>
        Ok(await service.GetMenuAsync(ct));

    [HttpPatch("productos/{slug}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(string slug, UpdateProductRequest request, CancellationToken ct) =>
        Ok(await service.UpdateProductAsync(slug, request, ct));
}
