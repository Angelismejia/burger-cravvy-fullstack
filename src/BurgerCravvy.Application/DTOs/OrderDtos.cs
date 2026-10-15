using BurgerCravvy.Domain.Entities;

namespace BurgerCravvy.Application.DTOs;

public record CreateOrderItemRequest(string ProductId, int Quantity);

public record CreateOrderRequest(string? CustomerName, List<CreateOrderItemRequest>? Items);

public record OrderItemDto(string ProductName, decimal UnitPrice, int Quantity, decimal Subtotal);

public record OrderDto(
    string Code,
    string CustomerName,
    string Status,
    string StatusLabel,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    decimal Total,
    IReadOnlyList<OrderItemDto> Items)
{
    public static OrderDto FromEntity(Order o) => new(
        o.Code, o.CustomerName, o.Status.ToString(), Order.Label(o.Status), AsUtc(o.CreatedAtUtc), o.UpdatedAtUtc is { } u ? AsUtc(u) : null, o.Total,
        o.Items.Select(i => new OrderItemDto(i.ProductName, i.UnitPrice, i.Quantity, i.Subtotal)).ToList());

    // SQL Server no guarda el "Kind": lo marcamos como UTC para que el JSON lleve la "Z".
    private static DateTime AsUtc(DateTime d) => DateTime.SpecifyKind(d, DateTimeKind.Utc);
}

/// <summary>Acción del panel: "preparar", "listo", "entregar" o "cancelar".</summary>
public record ChangeOrderStatusRequest(string? Action);
