using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;

namespace BurgerCravvy.Application.Services;

public interface IStaffService
{
    Task<IReadOnlyList<OrderDto>> GetOrderQueueAsync(CancellationToken ct = default);
    Task<OrderDto> ChangeOrderStatusAsync(string code, ChangeOrderStatusRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> GetMenuAsync(CancellationToken ct = default);
    /// <summary>Agotado / disponible: lo puede hacer cualquier empleado.</summary>
    Task<ProductDto> SetAvailabilityAsync(string slug, SetAvailabilityRequest request, CancellationToken ct = default);
}

public class StaffService(
    IOrderRepository orders, IProductRepository products, IUnitOfWork unitOfWork, IRealtimeNotifier notifier) : IStaffService
{
    public async Task<IReadOnlyList<OrderDto>> GetOrderQueueAsync(CancellationToken ct = default) =>
        (await orders.GetActiveAsync(ct)).Select(OrderDto.FromEntity).ToList();

    public async Task<OrderDto> ChangeOrderStatusAsync(string code, ChangeOrderStatusRequest request, CancellationToken ct = default)
    {
        var order = await orders.GetByCodeForUpdateAsync(code, ct)
            ?? throw new NotFoundException($"No existe el pedido «{code}».");

        Action transition = request.Action?.Trim().ToLowerInvariant() switch
        {
            "preparar" => order.StartPreparing,
            "listo" => order.MarkReady,
            "entregar" => order.MarkDelivered,
            "cancelar" => order.Cancel,
            _ => throw new ValidationException(new Dictionary<string, string[]>
            {
                ["action"] = ["Acción no válida. Usa: preparar, listo, entregar o cancelar."]
            })
        };
        transition();

        await unitOfWork.SaveChangesAsync(ct);
        var dto = OrderDto.FromEntity(order);
        await notifier.OrderUpdatedAsync(dto, ct);
        return dto;
    }

    /// <summary>Menú completo para el panel, incluidos los productos retirados.</summary>
    public async Task<IReadOnlyList<ProductDto>> GetMenuAsync(CancellationToken ct = default) =>
        (await products.GetAllAsync(onlyFavorites: false, includeArchived: true, ct)).Select(ProductDto.FromEntity).ToList();

    public async Task<ProductDto> SetAvailabilityAsync(string slug, SetAvailabilityRequest request, CancellationToken ct = default)
    {
        if (request.IsAvailable is not { } available)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["isAvailable"] = ["Indica si el producto está disponible (true) o agotado (false)."]
            });

        var product = await products.GetBySlugForUpdateAsync(slug, ct)
            ?? throw new NotFoundException($"No encontramos el producto «{slug}».");

        product.SetAvailability(available);

        await unitOfWork.SaveChangesAsync(ct);
        var dto = ProductDto.FromEntity(product);
        await notifier.ProductUpdatedAsync(dto, ct);
        return dto;
    }
}
