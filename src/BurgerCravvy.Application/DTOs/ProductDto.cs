using BurgerCravvy.Domain.Entities;

namespace BurgerCravvy.Application.DTOs;

public record ProductDto(
    string Id,
    string Name,
    string Description,
    decimal Price,
    string Image,
    string Alt,
    string Badge,
    string Category,
    bool IsAvailable,
    bool IsFavorite,
    bool IsArchived)
{
    public static ProductDto FromEntity(Product p) => new(
        p.Slug, p.Name, p.Description, p.Price, p.ImageUrl, p.ImageAlt,
        p.Badge.ToString().ToLowerInvariant(),
        p.Category.ToString().ToLowerInvariant(), p.IsAvailable, p.IsFavorite, p.IsArchived);
}

/// <summary>Datos para crear o editar un producto (solo Admin).
/// Sin <c>Category</c>, un producto nuevo va a «burger» y uno editado conserva la suya.</summary>
public record SaveProductRequest(
    string? Name,
    string? Description,
    decimal? Price,
    string? ImageUrl,
    string? ImageAlt,
    string? Badge,
    bool IsFavorite,
    string? Category = null);

/// <summary>Marcar un producto como agotado o disponible (cualquier empleado).</summary>
public record SetAvailabilityRequest(bool? IsAvailable);
