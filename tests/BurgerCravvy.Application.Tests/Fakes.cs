using BurgerCravvy.Application.Abstractions;
using BurgerCravvy.Application.DTOs;
using BurgerCravvy.Application.Exceptions;
using BurgerCravvy.Domain.Common;
using BurgerCravvy.Domain.Entities;
using BurgerCravvy.Domain.Enums;

namespace BurgerCravvy.Application.Tests;

/// <summary>Repositorios en memoria: los tests no necesitan SQL Server ni librerías de mocks.</summary>
internal class FakeProductRepository : IProductRepository
{
    public List<Product> Items { get; } = [];

    public FakeProductRepository(params Product[] products) => Items.AddRange(products);

    public Task<IReadOnlyList<Product>> GetAllAsync(bool onlyFavorites, bool includeArchived, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<Product>>(Items
            .Where(p => !onlyFavorites || p.IsFavorite)
            .Where(p => includeArchived || !p.IsArchived).ToList());

    public Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        Task.FromResult(Items.FirstOrDefault(p => p.Slug == slug));

    public Task<Product?> GetBySlugForUpdateAsync(string slug, CancellationToken ct = default) => GetBySlugAsync(slug, ct);

    public Task<IReadOnlyList<Product>> GetBySlugsAsync(IEnumerable<string> slugs, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<Product>>(Items.Where(p => slugs.Contains(p.Slug)).ToList());

    public Task<bool> SlugExistsAsync(string slug, CancellationToken ct = default) =>
        Task.FromResult(Items.Any(p => p.Slug == slug));

    public Task AddAsync(Product product, CancellationToken ct = default)
    {
        Items.Add(product);
        return Task.CompletedTask;
    }
}

internal class FakeOrderRepository : IOrderRepository
{
    public List<Order> Items { get; } = [];
    /// <summary>Cuántas veces responder "ese código ya existe" para simular colisiones.</summary>
    public int ForcedCollisions { get; set; }

    public Task AddAsync(Order order, CancellationToken ct = default)
    {
        Items.Add(order);
        return Task.CompletedTask;
    }

    public Task<bool> CodeExistsAsync(string code, CancellationToken ct = default)
    {
        if (ForcedCollisions > 0)
        {
            ForcedCollisions--;
            return Task.FromResult(true);
        }
        return Task.FromResult(Items.Any(o => o.Code == code));
    }

    public Task<Order?> GetByCodeAsync(string code, CancellationToken ct = default) =>
        Task.FromResult(Items.FirstOrDefault(o => o.Code == code));

    public Task<Order?> GetByCodeForUpdateAsync(string code, CancellationToken ct = default) => GetByCodeAsync(code, ct);

    public Task<IReadOnlyList<Order>> GetActiveAsync(CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<Order>>(Items
            .Where(o => o.Status is OrderStatus.Pending or OrderStatus.Preparing or OrderStatus.Ready).ToList());
}

internal class FakeEmployeeRepository(params Employee[] employees) : IEmployeeRepository
{
    public Task<Employee?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        Task.FromResult(employees.FirstOrDefault(e => e.Email == email));

    public Task<bool> AnyAsync(CancellationToken ct = default) => Task.FromResult(employees.Length > 0);

    public Task AddAsync(Employee employee, CancellationToken ct = default) => Task.CompletedTask;
}

internal class FakeUnitOfWork : IUnitOfWork
{
    public int SaveCount { get; private set; }
    /// <summary>Simula que otra persona guardó antes (lo que en SQL Server detecta el RowVersion).</summary>
    public bool SimulateConflict { get; set; }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        if (SimulateConflict) throw new ConflictException("Otra persona cambió este pedido al mismo tiempo.");
        SaveCount++;
        return Task.FromResult(1);
    }
}

/// <summary>Hasher trivial: "hash:" + contraseña. Suficiente para probar el flujo.</summary>
internal class FakePasswordHasher : IPasswordHasher
{
    public string Hash(Employee employee, string password) => "hash:" + password;
    public bool Verify(Employee employee, string password) => employee.PasswordHash == "hash:" + password;
}

internal class FakeTokenGenerator : IJwtTokenGenerator
{
    public AccessToken Generate(Employee employee) => new($"token-{employee.Email}", DateTime.UtcNow.AddHours(1));
}

/// <summary>Guarda los avisos enviados para poder comprobarlos.</summary>
internal class FakeNotifier : IRealtimeNotifier
{
    public List<(string Event, string Key)> Sent { get; } = [];

    public Task OrderCreatedAsync(OrderDto order, CancellationToken ct = default) => Record("OrderCreated", order.Code);
    public Task OrderUpdatedAsync(OrderDto order, CancellationToken ct = default) => Record("OrderUpdated", order.Code);
    public Task ProductUpdatedAsync(ProductDto product, CancellationToken ct = default) => Record("ProductUpdated", product.Id);

    private Task Record(string evt, string key)
    {
        Sent.Add((evt, key));
        return Task.CompletedTask;
    }
}

internal static class TestData
{
    public static Product Product(int id, string slug, decimal price = 8.99m) =>
        WithId(new Product(slug, slug, "Descripción", price, "https://example.test/img.jpg", "Imagen", ProductBadge.Sticker), id);

    public static Order Order(string customer = "Ana") => new(customer, OrderCode.Generate(DateTime.UtcNow));

    public static T WithId<T>(T entity, int id) where T : Entity
    {
        typeof(Entity).GetProperty(nameof(Entity.Id))!.SetValue(entity, id);
        return entity;
    }
}
