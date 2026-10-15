using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;
using BurgerCravvy.Domain.Entities;

namespace BurgerCravvy.Application.Services;

public interface IOrderService
{
    Task<OrderDto> CreateAsync(CreateOrderRequest request, CancellationToken ct = default);
    Task<OrderDto> GetByCodeAsync(string code, CancellationToken ct = default);
}

public class OrderService(IProductRepository products, IOrderRepository orders, IUnitOfWork unitOfWork) : IOrderService
{
    public async Task<OrderDto> CreateAsync(CreateOrderRequest request, CancellationToken ct = default)
    {
        Validate(request);

        // Los precios siempre salen de la base de datos, nunca del cliente.
        var slugs = request.Items!.Select(i => i.ProductId).Distinct().ToList();
        var found = await products.GetBySlugsAsync(slugs, ct);
        var bySlug = found.ToDictionary(p => p.Slug);

        var missing = slugs.Where(s => !bySlug.ContainsKey(s)).ToList();
        if (missing.Count > 0)
            throw new NotFoundException($"Productos no encontrados: {string.Join(", ", missing)}.");

        var order = new Order(request.CustomerName!);
        foreach (var item in request.Items!)
            order.AddItem(bySlug[item.ProductId], item.Quantity);
        order.EnsureHasItems();

        await orders.AddAsync(order, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return OrderDto.FromEntity(order);
    }

    public async Task<OrderDto> GetByCodeAsync(string code, CancellationToken ct = default)
    {
        var order = await orders.GetByCodeAsync(code, ct)
            ?? throw new NotFoundException($"No existe el pedido «{code}».");
        return OrderDto.FromEntity(order);
    }

    private static void Validate(CreateOrderRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            errors["customerName"] = ["Escribe tu nombre para el pedido."];
        else if (request.CustomerName.Trim().Length > 80)
            errors["customerName"] = ["El nombre no puede superar 80 caracteres."];

        if (request.Items is null || request.Items.Count == 0)
            errors["items"] = ["El pedido debe tener al menos un producto."];
        else if (request.Items.Any(i => i.Quantity < 1 || i.Quantity > OrderItem.MaxQuantity))
            errors["items"] = [$"Cada cantidad debe estar entre 1 y {OrderItem.MaxQuantity}."];

        if (errors.Count > 0) throw new ValidationException(errors);
    }
}
