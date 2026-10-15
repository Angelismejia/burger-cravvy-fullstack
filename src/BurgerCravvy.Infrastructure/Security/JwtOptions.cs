namespace BurgerCravvy.Infrastructure.Security;

public class JwtOptions
{
    public const string Section = "Jwt";

    public string Issuer { get; set; } = "BurgerCravvy";
    public string Audience { get; set; } = "BurgerCravvy.Panel";
    /// <summary>Clave HMAC de al menos 32 caracteres. En producción va en variables de entorno, nunca en el repo.</summary>
    public string Key { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 480;
}
