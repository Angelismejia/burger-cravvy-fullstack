using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace BurgerCravvy.Api.Realtime;

/// <summary>Implementación de <see cref="IRealtimeNotifier"/> con SignalR.</summary>
public class SignalRNotifier(IHubContext<OrdersHub> hub, ILogger<SignalRNotifier> logger) : IRealtimeNotifier
{
    public Task OrderCreatedAsync(OrderDto order, CancellationToken ct = default) =>
        Send(() => hub.Clients.Group(OrdersHub.KitchenGroup).SendAsync("OrderCreated", order, ct));

    public Task OrderUpdatedAsync(OrderDto order, CancellationToken ct = default) =>
        Send(() => hub.Clients
            .Groups(OrdersHub.KitchenGroup, OrdersHub.OrderGroup(order.Code))
            .SendAsync("OrderUpdated", order, ct));

    public Task ProductUpdatedAsync(ProductDto product, CancellationToken ct = default) =>
        Send(() => hub.Clients.All.SendAsync("ProductUpdated", product, ct));

    /// <summary>
    /// El cambio ya está guardado: si el aviso falla, lo registramos pero no rompemos la petición
    /// (los clientes se ponen al día con su refresco de respaldo).
    /// </summary>
    private async Task Send(Func<Task> send)
    {
        try
        {
            await send();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo enviar la notificación en tiempo real");
        }
    }
}
