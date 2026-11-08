using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;

namespace BurgerCravvy.Application.Services;

/// <summary>Gestión del menú. Solo para administradores.</summary>
public interface IMenuAdminService
{
    Task<ProductDto> CreateAsync(SaveProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateAsync(string slug, SaveProductRequest request, CancellationToken ct = default);
    Task<ProductDto> ArchiveAsync(string slug, CancellationToken ct = default);
    Task<ProductDto> RestoreAsync(string slug, CancellationToken ct = default);
}

public partial class MenuAdminService(IProductRepository products, IUnitOfWork unitOfWork, IRealtimeNotifier notifier)
    : IMenuAdminService
{
    public async Task<ProductDto> CreateAsync(SaveProductRequest request, CancellationToken ct = default)
    {
        var data = Validate(request);

        var product = new Product(await UniqueSlugAsync(data.Name, ct), data.Name, data.Description, data.Price,
            data.ImageUrl, data.ImageAlt, data.Badge, request.IsFavorite, data.Category ?? ProductCategory.Burger);

        await products.AddAsync(product, ct);
        return await SaveAndNotifyAsync(product, ct);
    }

    public async Task<ProductDto> UpdateAsync(string slug, SaveProductRequest request, CancellationToken ct = default)
    {
        var data = Validate(request);
        var product = await FindAsync(slug, ct);

        // El slug no cambia al renombrar: así no se rompen enlaces ni carritos guardados.
        product.UpdateDetails(data.Name, data.Description, data.ImageUrl, data.ImageAlt, data.Badge);
        product.ChangePrice(data.Price);
        if (data.Category is { } category) product.ChangeCategory(category);
        if (!product.IsArchived) product.SetFavorite(request.IsFavorite);

        return await SaveAndNotifyAsync(product, ct);
    }

    public async Task<ProductDto> ArchiveAsync(string slug, CancellationToken ct = default)
    {
        var product = await FindAsync(slug, ct);
        product.Archive();
        return await SaveAndNotifyAsync(product, ct);
    }

    public async Task<ProductDto> RestoreAsync(string slug, CancellationToken ct = default)
    {
        var product = await FindAsync(slug, ct);
        product.Restore();
        return await SaveAndNotifyAsync(product, ct);
    }

    private async Task<Product> FindAsync(string slug, CancellationToken ct) =>
        await products.GetBySlugForUpdateAsync(slug, ct)
        ?? throw new NotFoundException($"No encontramos el producto «{slug}».");

    private async Task<ProductDto> SaveAndNotifyAsync(Product product, CancellationToken ct)
    {
        await unitOfWork.SaveChangesAsync(ct);
        var dto = ProductDto.FromEntity(product);
        await notifier.ProductUpdatedAsync(dto, ct);
        return dto;
    }

    // ---------- validación ----------

    private record ValidProduct(string Name, string Description, decimal Price, string ImageUrl, string ImageAlt, ProductBadge Badge,
        ProductCategory? Category);

    private static ValidProduct Validate(SaveProductRequest r)
    {
        var errors = new Dictionary<string, string[]>();
        void Error(string field, string message) => errors[field] = [message];

        var name = r.Name?.Trim() ?? string.Empty;
        if (name.Length == 0) Error("name", "Escribe el nombre del producto.");
        else if (name.Length > 80) Error("name", "El nombre no puede superar 80 caracteres.");

        var description = r.Description?.Trim() ?? string.Empty;
        if (description.Length > 300) Error("description", "La descripción no puede superar 300 caracteres.");

        if (r.Price is not { } price || price <= 0) Error("price", "El precio debe ser mayor que cero.");
        else if (price > Product.MaxPrice) Error("price", $"El precio no puede superar {Product.MaxPrice:0}.");

        var imageUrl = r.ImageUrl?.Trim() ?? string.Empty;
        if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) || (uri.Scheme != "https" && uri.Scheme != "http"))
            Error("imageUrl", "La foto debe ser una dirección web (https://…).");
        else if (imageUrl.Length > 500) Error("imageUrl", "La dirección de la foto es demasiado larga.");

        var imageAlt = r.ImageAlt?.Trim() ?? string.Empty;
        if (imageAlt.Length > 200) Error("imageAlt", "La descripción de la foto no puede superar 200 caracteres.");

        if (!Enum.TryParse<ProductBadge>(r.Badge, ignoreCase: true, out var badge) || !Enum.IsDefined(badge))
            Error("badge", "Elige un distintivo: sticker, heart, fries o none.");

        ProductCategory? category = null;
        if (!string.IsNullOrWhiteSpace(r.Category))
        {
            if (Enum.TryParse<ProductCategory>(r.Category, ignoreCase: true, out var c) && Enum.IsDefined(c)) category = c;
            else Error("category", "Elige una categoría: burger, side, drink o dessert.");
        }

        if (errors.Count > 0) throw new ValidationException(errors);
        return new ValidProduct(name, description, r.Price!.Value, imageUrl, imageAlt, badge, category);
    }

    // ---------- slug ----------

    /// <summary>"Bacon Lovers Ñam" → "bacon-lovers-nam"; si ya existe, "bacon-lovers-nam-2".</summary>
    private async Task<string> UniqueSlugAsync(string name, CancellationToken ct)
    {
        var baseSlug = Slugify(name);
        var slug = baseSlug;
        for (var n = 2; await products.SlugExistsAsync(slug, ct); n++) slug = $"{baseSlug}-{n}";
        return slug;
    }

    public static string Slugify(string text)
    {
        var normalized = text.Normalize(NormalizationForm.FormD);
        var withoutAccents = new string(normalized
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark).ToArray());
        var slug = NonAlphanumeric().Replace(withoutAccents.ToLowerInvariant(), "-").Trim('-');
        if (slug.Length > 50) slug = slug[..50].TrimEnd('-');
        return slug.Length > 0 ? slug : "producto";
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonAlphanumeric();
}
