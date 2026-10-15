using BurgerCravvy.Domain.Entities;

namespace BurgerCravvy.Application.Abstractions;

public interface IProductRepository
{
    Task<IReadOnlyList<Product>> GetAllAsync(bool onlyFavorites, CancellationToken ct = default);
    Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<Product?> GetBySlugForUpdateAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> GetBySlugsAsync(IEnumerable<string> slugs, CancellationToken ct = default);
}
