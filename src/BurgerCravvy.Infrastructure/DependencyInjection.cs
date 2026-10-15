using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Infrastructure.Persistence;
using BurgerCravvy.Infrastructure.Repositories;
using BurgerCravvy.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BurgerCravvy.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connection = configuration.GetConnectionString("BurgerCravvy")
            ?? throw new InvalidOperationException("Falta la cadena de conexión 'BurgerCravvy'.");

        // Azure SQL gratuito se pausa solo y tarda en "despertar": se reintenta más veces.
        services.AddDbContext<AppDbContext>(o => o.UseSqlServer(connection,
            sql => sql.EnableRetryOnFailure(6)));
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();

        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.Section))
            .Validate(o => o.Key.Length >= 32, "Jwt:Key debe tener al menos 32 caracteres.")
            .ValidateOnStart();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        return services;
    }
}
