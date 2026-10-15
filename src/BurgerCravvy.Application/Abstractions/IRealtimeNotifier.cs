using BurgerCravvy.Application.DTOs;

namespace BurgerCravvy.Application.Abstractions;

/// <summary>
/// Avisa en tiempo real de cambios en pedidos y menú. Los casos de uso no saben
/// cómo se entrega el aviso (SignalR vive en la capa Api).
/// </summary>
public interface IRealtimeNotifier
{
    /// <summary>Pedido nuevo: le llega a la cocina.</summary>
    Task OrderCreatedAsync(OrderDto order, CancellationToken ct = default);

    /// <summary>Cambio de estado: le llega a la cocina y al cliente que sigue ese pedido.</summary>
    Task OrderUpdatedAsync(OrderDto order, CancellationToken ct = default);

    /// <summary>Precio o disponibilidad: le llega a todos los visitantes.</summary>
    Task ProductUpdatedAsync(ProductDto product, CancellationToken ct = default);
}
