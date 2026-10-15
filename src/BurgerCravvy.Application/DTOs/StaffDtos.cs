namespace BurgerCravvy.Application.DTOs;

public record LoginRequest(string? Email, string? Password);

public record LoginResponse(string Token, DateTime ExpiresAtUtc, string FullName, string Role);

public record UpdateProductRequest(bool? IsAvailable, decimal? Price);
