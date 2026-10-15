using BurgerCravvy.Domain.Entities;

namespace BurgerCravvy.Application.Abstractions;

public interface IProductRepository
{
    /// <param name="onlyFavorites">Solo los de «Nuestros Favoritos».</param>
    /// <param name="includeArchived">Incluir los retirados del menú (solo para el panel).</param>
    Task<IReadOnlyList<Product>> GetAllAsync(bool onlyFavorites, bool includeArchived, CancellationToken ct = default);
    Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<Product?> GetBySlugForUpdateAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> GetBySlugsAsync(IEnumerable<string> slugs, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default);
    Task AddAsync(Product product, CancellationToken ct = default);
}
