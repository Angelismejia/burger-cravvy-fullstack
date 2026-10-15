using BurgerCravvy.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BurgerCravvy.Api.Realtime;

/// <summary>
/// Hub de tiempo real. Los clientes anónimos pueden seguir su propio pedido y recibir
/// cambios del menú; solo los empleados autenticados entran al grupo de cocina.
/// </summary>
public class OrdersHub : Hub
{
    public const string Path = "/hubs/pedidos";
    public const string KitchenGroup = "cocina";

    public static string OrderGroup(string code) => $"pedido-{code}";

    [Authorize(Roles = "Empleado,Admin")]
    public Task JoinKitchen() => Groups.AddToGroupAsync(Context.ConnectionId, KitchenGroup);

    public Task TrackOrder(string code) =>
        Groups.AddToGroupAsync(Context.ConnectionId, OrderGroup(Normalize(code)));

    public Task StopTracking(string code) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, OrderGroup(Normalize(code)));

    private static string Normalize(string code)
    {
        var normalized = code?.Trim().ToUpperInvariant() ?? string.Empty;
        if (!OrderCode.IsValid(normalized)) throw new HubException("El código del pedido no es válido.");
        return normalized;
    }
}
