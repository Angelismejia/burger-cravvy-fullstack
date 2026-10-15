using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Enums;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Domain.Entities;

public class Order : Entity
{
    private readonly List<OrderItem> _items = [];

    public string Code { get; private set; } = string.Empty;
    public string CustomerName { get; private set; } = string.Empty;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public DateTime CreatedAtUtc { get; private set; }
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public decimal Total => _items.Sum(i => i.Subtotal);

    private Order() { } // EF Core

    public Order(string customerName)
    {
        if (string.IsNullOrWhiteSpace(customerName))
            throw new DomainException("El nombre del cliente es obligatorio.");
        CustomerName = customerName.Trim();
        CreatedAtUtc = DateTime.UtcNow;
        Code = $"BC-{CreatedAtUtc:yyMMdd}-{Random.Shared.Next(1000, 9999)}";
    }

    public void AddItem(Product product, int quantity)
    {
        if (!product.IsAvailable)
            throw new DomainException($"«{product.Name}» no está disponible ahora mismo.");

        var existing = _items.FirstOrDefault(i => i.ProductId == product.Id);
        if (existing is not null) existing.SetQuantity(existing.Quantity + quantity);
        else _items.Add(new OrderItem(product, quantity));
    }

    public void EnsureHasItems()
    {
        if (_items.Count == 0) throw new DomainException("El pedido debe tener al menos un producto.");
    }

    public DateTime? UpdatedAtUtc { get; private set; }

    /// <summary>Pendiente → En preparación.</summary>
    public void StartPreparing() => MoveTo(OrderStatus.Preparing, OrderStatus.Pending);

    /// <summary>En preparación → Listo.</summary>
    public void MarkReady() => MoveTo(OrderStatus.Ready, OrderStatus.Preparing);

    /// <summary>Listo → Entregado.</summary>
    public void MarkDelivered() => MoveTo(OrderStatus.Delivered, OrderStatus.Ready);

    /// <summary>Solo se cancela lo que aún no está listo.</summary>
    public void Cancel() => MoveTo(OrderStatus.Cancelled, OrderStatus.Pending, OrderStatus.Preparing);

    private void MoveTo(OrderStatus next, params OrderStatus[] allowedFrom)
    {
        if (!allowedFrom.Contains(Status))
            throw new DomainException($"No se puede pasar el pedido de «{Label(Status)}» a «{Label(next)}».");
        Status = next;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public static string Label(OrderStatus status) => status switch
    {
        OrderStatus.Pending => "Pendiente",
        OrderStatus.Preparing => "En preparación",
        OrderStatus.Ready => "Listo",
        OrderStatus.Delivered => "Entregado",
        OrderStatus.Cancelled => "Cancelado",
        _ => status.ToString()
    };
}
