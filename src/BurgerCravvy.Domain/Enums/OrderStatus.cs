namespace BurgerCravvy.Domain.Enums;

public enum OrderStatus
{
    /// <summary>Pedido registrado, sin pago (modo demostración).</summary>
    Pending = 0,
    Preparing = 1,
    Ready = 2,
    Cancelled = 3,
    Delivered = 4
}
