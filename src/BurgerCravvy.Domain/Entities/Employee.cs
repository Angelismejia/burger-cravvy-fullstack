using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Enums;
using BurgerCravvy.Domain.Exceptions;

namespace BurgerCravvy.Domain.Entities;

/// <summary>Personal interno con acceso al panel de cocina.</summary>
public class Employee : Entity
{
    public string Email { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public EmployeeRole Role { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Employee() { } // EF Core

    public Employee(string email, string fullName, EmployeeRole role)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            throw new DomainException("El correo del empleado no es válido.");
        if (string.IsNullOrWhiteSpace(fullName))
            throw new DomainException("El nombre del empleado es obligatorio.");
        Email = email.Trim().ToLowerInvariant();
        FullName = fullName.Trim();
        Role = role;
    }

    /// <summary>El hash lo calcula la infraestructura; el dominio nunca ve la contraseña.</summary>
    public void SetPasswordHash(string hash)
    {
        if (string.IsNullOrWhiteSpace(hash)) throw new DomainException("Hash de contraseña vacío.");
        PasswordHash = hash;
    }

    public void Deactivate() => IsActive = false;
}
