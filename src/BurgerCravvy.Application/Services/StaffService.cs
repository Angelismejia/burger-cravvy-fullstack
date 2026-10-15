using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;

namespace BurgerCravvy.Application.Services;

public interface IStaffService
{
    Task<IReadOnlyList<OrderDto>> GetOrderQueueAsync(CancellationToken ct = default);
    Task<OrderDto> ChangeOrderStatusAsync(string code, ChangeOrderStatusRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ProductDto>> GetMenuAsync(CancellationToken ct = default);
    Task<ProductDto> UpdateProductAsync(string slug, UpdateProductRequest request, CancellationToken ct = default);
}

public class StaffService(IOrderRepository orders, IProductRepository products, IUnitOfWork unitOfWork) : IStaffService
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
        return OrderDto.FromEntity(order);
    }

    public async Task<IReadOnlyList<ProductDto>> GetMenuAsync(CancellationToken ct = default) =>
        (await products.GetAllAsync(onlyFavorites: false, ct)).Select(ProductDto.FromEntity).ToList();

    public async Task<ProductDto> UpdateProductAsync(string slug, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await products.GetBySlugForUpdateAsync(slug, ct)
            ?? throw new NotFoundException($"No encontramos el producto «{slug}».");

        if (request.IsAvailable is { } available) product.SetAvailability(available);
        if (request.Price is { } price) product.ChangePrice(price);

        await unitOfWork.SaveChangesAsync(ct);
        return ProductDto.FromEntity(product);
    }
}
