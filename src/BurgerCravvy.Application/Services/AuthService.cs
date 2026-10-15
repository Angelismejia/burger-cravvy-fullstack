using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;

namespace BurgerCravvy.Application.Services;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
}

public class AuthService(IEmployeeRepository employees, IPasswordHasher hasher, IJwtTokenGenerator tokens) : IAuthService
{
    // Mismo mensaje para correo o contraseña incorrectos: no revelamos qué cuentas existen.
    private const string InvalidCredentials = "Correo o contraseña incorrectos.";

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["credentials"] = ["Escribe tu correo y tu contraseña."]
            });

        var employee = await employees.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct);
        if (employee is null || !employee.IsActive || !hasher.Verify(employee, request.Password))
            throw new UnauthorizedException(InvalidCredentials);

        var token = tokens.Generate(employee);
        return new LoginResponse(token.Token, token.ExpiresAtUtc, employee.FullName, employee.Role.ToString());
    }
}
