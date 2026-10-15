using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;

namespace BurgerCravvy.Application.Services;

public interface IProductService
{
    Task<IReadOnlyList<ProductDto>> GetMenuAsync(bool onlyFavorites, CancellationToken ct = default);
    Task<ProductDto> GetBySlugAsync(string slug, CancellationToken ct = default);
}

public class ProductService(IProductRepository products) : IProductService
{
    public async Task<IReadOnlyList<ProductDto>> GetMenuAsync(bool onlyFavorites, CancellationToken ct = default)
    {
        var list = await products.GetAllAsync(onlyFavorites, includeArchived: false, ct);
        return list.Select(ProductDto.FromEntity).ToList();
    }

    public async Task<ProductDto> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var product = await products.GetBySlugAsync(slug, ct);
        // Para el público, un producto retirado del menú no existe.
        if (product is null || product.IsArchived)
            throw new NotFoundException($"No encontramos el producto «{slug}».");
        return ProductDto.FromEntity(product);
    }
}
