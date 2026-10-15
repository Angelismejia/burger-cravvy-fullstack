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
    bool IsAvailable)
{
    public static ProductDto FromEntity(Product p) => new(
        p.Slug, p.Name, p.Description, p.Price, p.ImageUrl, p.ImageAlt,
        p.Badge.ToString().ToLowerInvariant(), p.IsAvailable);
}
