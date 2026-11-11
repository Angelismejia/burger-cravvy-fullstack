using System.Net.Http.Headers;
using System.Net.Http.Json;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BurgerCravvy.Api.IntegrationTests;

/// <summary>
/// Levanta la API completa (controladores, JWT, EF Core, migraciones y datos semilla) contra una
/// base de datos SQL Server real y temporal, que se borra al terminar.
/// Servidor: variable de entorno TEST_SQL_SERVER (en el CI, un contenedor) o .\SQLEXPRESS en local.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string EmployeeEmail = "cocina@tests.local";
    public const string AdminEmail = "admin@tests.local";
    public const string Password = "Contraseña-de-tests-1";

    private readonly string _connectionString;
    private readonly Dictionary<string, string> _tokens = [];

    public ApiFactory()
    {
        var server = Environment.GetEnvironmentVariable("TEST_SQL_SERVER")
            ?? @"Server=.\SQLEXPRESS;Trusted_Connection=True;TrustServerCertificate=True";
        _connectionString = $"{server};Database=BurgerCravvyTests_{Guid.NewGuid():N}";
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing"); // no carga appsettings.Development.json
        builder.UseSetting("ConnectionStrings:BurgerCravvy", _connectionString);
        builder.UseSetting("Jwt:Key", "clave-solo-para-tests-de-integracion-0123456789");
        builder.UseSetting("SeedEmployee:Email", EmployeeEmail);
        builder.UseSetting("SeedEmployee:Password", Password);
        builder.UseSetting("SeedAdmin:Email", AdminEmail);
        builder.UseSetting("SeedAdmin:Password", Password);
    }

    /// <summary>Arranca la API (aplica migraciones y siembra) antes del primer test.</summary>
    public Task InitializeAsync()
    {
        _ = Server;
        return Task.CompletedTask;
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        using (var scope = Services.CreateScope())
            await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureDeletedAsync();
        await DisposeAsync();
    }

    /// <summary>
    /// Cliente con el JWT del usuario. Se hace login una sola vez por usuario porque la API
    /// limita a 5 intentos de login por minuto (y en los tests todas las peticiones vienen de la misma "IP").
    /// </summary>
    public async Task<HttpClient> ClientAsAsync(string email)
    {
        if (!_tokens.TryGetValue(email, out var token))
        {
            var res = await CreateClient().PostAsJsonAsync("/api/auth/login", new LoginRequest(email, Password));
            res.EnsureSuccessStatusCode();
            token = (await res.Content.ReadFromJsonAsync<LoginResponse>())!.Token;
            _tokens[email] = token;
        }

        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}

[CollectionDefinition(Name)]
public class ApiCollection : ICollectionFixture<ApiFactory>
{
    public const string Name = "API";
}
