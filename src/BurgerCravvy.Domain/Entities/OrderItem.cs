using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Domain.Entities;

public class OrderItem : Entity
{
    public const int MaxQuantity = 50;

    public int OrderId { get; private set; }
    public int ProductId { get; private set; }
    public Product? Product { get; private set; }
    /// <summary>Nombre y precio copiados al momento del pedido.</summary>
    public string ProductName { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public decimal Subtotal => UnitPrice * Quantity;

    private OrderItem() { } // EF Core

    internal OrderItem(Product product, int quantity)
    {
        ProductId = product.Id;
        ProductName = product.Name;
        UnitPrice = product.Price;
        SetQuantity(quantity);
    }

    internal void SetQuantity(int quantity)
    {
        if (quantity is < 1 or > MaxQuantity)
            throw new DomainException($"La cantidad debe estar entre 1 y {MaxQuantity}.");
        Quantity = quantity;
    }
}
