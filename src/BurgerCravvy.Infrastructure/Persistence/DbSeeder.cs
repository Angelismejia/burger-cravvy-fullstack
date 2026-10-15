using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace BurgerCravvy.Infrastructure.Persistence;

public static class DbSeeder
{
    /// <summary>Secciones de configuración con usuarios de prueba y el rol de cada uno.</summary>
    private static readonly (string Section, EmployeeRole Role, string DefaultName)[] SeedUsers =
    [
        ("SeedEmployee", EmployeeRole.Empleado, "Equipo Cocina"),
        ("SeedAdmin", EmployeeRole.Admin, "Administración"),
    ];

    /// <summary>
    /// Aplica migraciones y crea los usuarios de prueba configurados en "SeedEmployee" y "SeedAdmin"
    /// (en appsettings.Development.json o en variables de entorno). Si el correo ya existe, no lo toca.
    /// </summary>
    public static async Task MigrateAndSeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        var employees = sp.GetRequiredService<IEmployeeRepository>();
        var hasher = sp.GetRequiredService<IPasswordHasher>();
        var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        foreach (var (section, role, defaultName) in SeedUsers)
        {
            var seed = configuration.GetSection(section);
            var email = seed["Email"];
            var password = seed["Password"];
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) continue;
            if (await employees.GetByEmailAsync(email.Trim().ToLowerInvariant()) is not null) continue;

            var employee = new Employee(email, seed["FullName"] ?? defaultName, role);
            employee.SetPasswordHash(hasher.Hash(employee, password));
            await employees.AddAsync(employee);
            await db.SaveChangesAsync();
            logger.LogInformation("Usuario de prueba creado: {Email} ({Role})", employee.Email, role);
        }
    }
}
