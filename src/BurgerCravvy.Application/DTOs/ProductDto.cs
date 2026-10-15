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
    bool IsAvailable,
    bool IsFavorite,
    bool IsArchived)
{
    public static ProductDto FromEntity(Product p) => new(
        p.Slug, p.Name, p.Description, p.Price, p.ImageUrl, p.ImageAlt,
        p.Badge.ToString().ToLowerInvariant(), p.IsAvailable, p.IsFavorite, p.IsArchived);
}

/// <summary>Datos para crear o editar un producto (solo Admin).</summary>
public record SaveProductRequest(
    string? Name,
    string? Description,
    decimal? Price,
    string? ImageUrl,
    string? ImageAlt,
    string? Badge,
    bool IsFavorite);

/// <summary>Marcar un producto como agotado o disponible (cualquier empleado).</summary>
public record SetAvailabilityRequest(bool? IsAvailable);
