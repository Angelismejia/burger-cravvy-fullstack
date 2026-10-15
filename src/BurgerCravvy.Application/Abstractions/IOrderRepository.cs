using BurgerCravvy.Domain.Entities;

namespace BurgerCravvy.Application.Abstractions;

public interface IOrderRepository
{
    Task AddAsync(Order order, CancellationToken ct = default);
    Task<Order?> GetByCodeAsync(string code, CancellationToken ct = default);
    /// <summary>Pedido con seguimiento de cambios, para modificar su estado.</summary>
    Task<Order?> GetByCodeForUpdateAsync(string code, CancellationToken ct = default);
    /// <summary>Pedidos en cola (pendientes, en preparación y listos).</summary>
    Task<IReadOnlyList<Order>> GetActiveAsync(CancellationToken ct = default);
}
