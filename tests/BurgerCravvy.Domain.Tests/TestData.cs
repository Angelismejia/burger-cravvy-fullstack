using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;

namespace BurgerCravvy.Domain.Tests;

internal static class TestData
{
    /// <summary>Producto con Id asignado, como si viniera de la base de datos.</summary>
    public static Product Product(int id = 1, decimal price = 8.99m, string? slug = null) =>
        WithId(new Product(slug ?? $"producto-{id}", $"Producto {id}", "Descripción", price,
            "https://example.test/img.jpg", "Imagen", ProductBadge.Sticker), id);

    public static Order Order(string customer = "Ana") =>
        new(customer, OrderCode.Generate(DateTime.UtcNow));

    public static T WithId<T>(T entity, int id) where T : Entity
    {
        typeof(Entity).GetProperty(nameof(Entity.Id))!.SetValue(entity, id);
        return entity;
    }
}
