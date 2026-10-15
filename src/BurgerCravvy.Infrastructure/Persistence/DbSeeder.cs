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
    /// <summary>
    /// Aplica migraciones y, si no hay empleados, crea uno con los datos de "SeedEmployee"
    /// (solo se configura en appsettings.Development.json).
    /// </summary>
    public static async Task MigrateAndSeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        var seed = configuration.GetSection("SeedEmployee");
        var email = seed["Email"];
        var password = seed["Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return;

        var employees = sp.GetRequiredService<IEmployeeRepository>();
        if (await employees.AnyAsync()) return;

        var employee = new Employee(email, seed["FullName"] ?? "Equipo Cocina", EmployeeRole.Empleado);
        employee.SetPasswordHash(sp.GetRequiredService<IPasswordHasher>().Hash(employee, password));
        await employees.AddAsync(employee);
        await db.SaveChangesAsync();

        sp.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder")
            .LogInformation("Empleado de prueba creado: {Email}", employee.Email);
    }
}
