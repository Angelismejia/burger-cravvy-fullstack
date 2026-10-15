using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BurgerCravvy.Infrastructure.Repositories;

public class ProductRepository(AppDbContext db) : IProductRepository
{
    public async Task<IReadOnlyList<Product>> GetAllAsync(bool onlyFavorites, bool includeArchived, CancellationToken ct = default) =>
        await db.Products.AsNoTracking()
            .Where(p => !onlyFavorites || p.IsFavorite)
            .Where(p => includeArchived || !p.IsArchived)
            .OrderBy(p => p.IsArchived).ThenBy(p => p.Id)
            .ToListAsync(ct);

    public Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public Task<Product?> GetBySlugForUpdateAsync(string slug, CancellationToken ct = default) =>
        db.Products.FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public async Task<IReadOnlyList<Product>> GetBySlugsAsync(IEnumerable<string> slugs, CancellationToken ct = default)
    {
        var list = slugs.ToList();
        return await db.Products.Where(p => list.Contains(p.Slug)).ToListAsync(ct);
    }

    public Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default) =>
        db.Products.AnyAsync(p => p.Slug == slug, ct);

    public async Task AddAsync(Product product, CancellationToken ct = default) =>
        await db.Products.AddAsync(product, ct);
}
