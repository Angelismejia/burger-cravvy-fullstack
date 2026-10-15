using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BurgerCravvy.Api.Controllers;

[ApiController]
[Route("api/productos")]
public class ProductsController(IProductService service) : ControllerBase
{
    /// <summary>Lista el menú. Usa <c>?favoritos=true</c> para "Nuestros favoritos".</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetAll([FromQuery] bool favoritos, CancellationToken ct) =>
        Ok(await service.GetMenuAsync(favoritos, ct));

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDto>> GetBySlug(string slug, CancellationToken ct) =>
        Ok(await service.GetBySlugAsync(slug, ct));
}
