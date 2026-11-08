namespace BurgerCravvy.Api;

/// <summary>Nombres de las políticas de límite de peticiones (se configuran en Program.cs).</summary>
public static class RateLimitPolicies
{
    /// <summary>Login: 5 intentos por minuto y por IP, contra ataques de fuerza bruta.</summary>
    public const string Login = "login";

    /// <summary>Crear pedidos: 10 por minuto y por IP, para que nadie llene la base de pedidos falsos.</summary>
    public const string Orders = "orders";
}
