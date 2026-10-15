using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Enums;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Domain.Entities;

public class Product : Entity
{
    public string Slug { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string ImageUrl { get; private set; } = string.Empty;
    public string ImageAlt { get; private set; } = string.Empty;
    public ProductBadge Badge { get; private set; }
    public bool IsFavorite { get; private set; }
    public bool IsAvailable { get; private set; } = true;

    private Product() { } // EF Core

    public Product(string slug, string name, string description, decimal price,
        string imageUrl, string imageAlt, ProductBadge badge, bool isFavorite = true)
    {
        if (string.IsNullOrWhiteSpace(slug)) throw new DomainException("El identificador del producto es obligatorio.");
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("El nombre del producto es obligatorio.");
        Slug = slug;
        Name = name;
        Description = description;
        ImageUrl = imageUrl;
        ImageAlt = imageAlt;
        Badge = badge;
        IsFavorite = isFavorite;
        ChangePrice(price);
    }

    public void ChangePrice(decimal price)
    {
        if (price <= 0) throw new DomainException("El precio debe ser mayor que cero.");
        Price = decimal.Round(price, 2);
    }

    public void SetAvailability(bool available) => IsAvailable = available;
}
