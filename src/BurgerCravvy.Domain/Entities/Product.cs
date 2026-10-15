using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Enums;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Domain.Entities;

public class Product : Entity
{
    public const decimal MaxPrice = 1000m;

    public string Slug { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string ImageUrl { get; private set; } = string.Empty;
    public string ImageAlt { get; private set; } = string.Empty;
    public ProductBadge Badge { get; private set; }
    public bool IsFavorite { get; private set; }
    public bool IsAvailable { get; private set; } = true;
    /// <summary>Retirado del menú: no se muestra ni se puede pedir, pero los pedidos antiguos lo conservan.</summary>
    public bool IsArchived { get; private set; }

    /// <summary>Se puede añadir a un pedido nuevo.</summary>
    public bool CanBeOrdered => IsAvailable && !IsArchived;

    private Product() { } // EF Core

    public Product(string slug, string name, string description, decimal price,
        string imageUrl, string imageAlt, ProductBadge badge, bool isFavorite = true)
    {
        if (string.IsNullOrWhiteSpace(slug)) throw new DomainException("El identificador del producto es obligatorio.");
        Slug = slug;
        UpdateDetails(name, description, imageUrl, imageAlt, badge);
        IsFavorite = isFavorite;
        ChangePrice(price);
    }

    public void UpdateDetails(string name, string description, string imageUrl, string imageAlt, ProductBadge badge)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("El nombre del producto es obligatorio.");
        if (string.IsNullOrWhiteSpace(imageUrl)) throw new DomainException("La foto del producto es obligatoria.");
        if (!Enum.IsDefined(badge)) throw new DomainException("El distintivo del producto no es válido.");
        Name = name.Trim();
        Description = description?.Trim() ?? string.Empty;
        ImageUrl = imageUrl.Trim();
        ImageAlt = string.IsNullOrWhiteSpace(imageAlt) ? Name : imageAlt.Trim();
        Badge = badge;
    }

    public void ChangePrice(decimal price)
    {
        if (price <= 0) throw new DomainException("El precio debe ser mayor que cero.");
        if (price > MaxPrice) throw new DomainException($"El precio no puede superar {MaxPrice:0}.");
        Price = decimal.Round(price, 2);
    }

    public void SetAvailability(bool available) => IsAvailable = available;

    public void SetFavorite(bool favorite) => IsFavorite = favorite;

    /// <summary>Retirar del menú. Un producto retirado deja de ser favorito.</summary>
    public void Archive()
    {
        IsArchived = true;
        IsFavorite = false;
    }

    public void Restore() => IsArchived = false;
}
