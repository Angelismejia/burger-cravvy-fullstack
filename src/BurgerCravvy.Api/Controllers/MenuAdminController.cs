using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BurgerCravvy.Api.Controllers;

/// <summary>Gestión del menú. Requiere JWT con rol Admin.</summary>
[ApiController]
[Route("api/panel/productos")]
[Authorize(Roles = "Admin")]
public class MenuAdminController(IMenuAdminService service) : ControllerBase
{
    /// <summary>Crea un producto. El identificador (slug) se genera a partir del nombre.</summary>
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(SaveProductRequest request, CancellationToken ct)
    {
        var product = await service.CreateAsync(request, ct);
        return Created($"/api/productos/{product.Id}", product);
    }

    /// <summary>Edita nombre, descripción, precio, foto, distintivo y si sale en favoritos.</summary>
    [HttpPut("{slug}")]
    public async Task<ActionResult<ProductDto>> Update(string slug, SaveProductRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(slug, request, ct));

    /// <summary>Retira el producto del menú (no se borra: los pedidos antiguos lo conservan).</summary>
    [HttpPost("{slug}/retirar")]
    public async Task<ActionResult<ProductDto>> Archive(string slug, CancellationToken ct) =>
        Ok(await service.ArchiveAsync(slug, ct));

    /// <summary>Vuelve a poner en el menú un producto retirado.</summary>
    [HttpPost("{slug}/reactivar")]
    public async Task<ActionResult<ProductDto>> Restore(string slug, CancellationToken ct) =>
        Ok(await service.RestoreAsync(slug, ct));
}
