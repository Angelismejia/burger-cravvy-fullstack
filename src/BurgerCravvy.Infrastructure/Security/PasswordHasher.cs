using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace BurgerCravvy.Infrastructure.Security;

/// <summary>Usa el hasher de ASP.NET Core Identity (PBKDF2 con sal).</summary>
public class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<Employee> _inner = new();

    public string Hash(Employee employee, string password) => _inner.HashPassword(employee, password);

    public bool Verify(Employee employee, string password) =>
        _inner.VerifyHashedPassword(employee, employee.PasswordHash, password) != PasswordVerificationResult.Failed;
}
